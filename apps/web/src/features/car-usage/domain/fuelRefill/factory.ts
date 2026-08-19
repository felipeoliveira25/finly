import type { FuelRefillDTO } from '@finly/shared-types'
import type { FuelRefill } from './model'

interface CreateFuelRefillParams {
  date: string
  amountCents: number
  description?: string
}

interface FuelRefillFormValues {
  date: string
  amountR$: string   // texto do formulário, ex: "150.00"
  description?: string
}

/**
 * Constrói uma entidade FuelRefill a partir de input do usuário.
 * Valida as regras de negócio — lança Error se o estado for inválido.
 */
export function createFuelRefill(params: CreateFuelRefillParams): FuelRefill {
  if (params.amountCents <= 0) {
    throw new Error('O valor do abastecimento deve ser maior que zero')
  }

  return {
    id: 0,
    date: params.date,
    amountCents: params.amountCents,
    description: params.description ?? null,
    periodId: null,
    createdAt: '',
  }
}

/**
 * Transforma um FuelRefillDTO vindo da API em entidade de domínio.
 */
export function hydrateFuelRefill(dto: FuelRefillDTO): FuelRefill {
  return {
    id: dto.id,
    date: dto.date,
    amountCents: dto.amountCents,
    description: dto.description,
    periodId: dto.periodId,
    createdAt: dto.createdAt,
  }
}

/**
 * Normaliza valores brutos do formulário e retorna os params validados.
 * Converte amountR$ (string com vírgula ou ponto) para amountCents (inteiro).
 */
export function buildFuelRefill(values: FuelRefillFormValues): CreateFuelRefillParams {
  const normalized = values.amountR$.replace(',', '.')
  const amount = parseFloat(normalized)
  if (isNaN(amount)) {
    throw new Error('Valor inválido')
  }

  const params: CreateFuelRefillParams = {
    date: values.date,
    amountCents: Math.round(amount * 100),
    description: values.description,
  }

  createFuelRefill(params)

  return params
}
