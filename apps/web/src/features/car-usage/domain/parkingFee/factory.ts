import type { ParkingFeeDTO } from '@finly/shared-types'
import type { ParkingFee } from './model'

interface CreateParkingFeeParams {
  date: string
  amountCents: number
  description?: string
}

interface ParkingFeeFormValues {
  date: string
  amountR$: string   // texto do formulário, ex: "15.90"
  description?: string
}

/**
 * Constrói uma entidade ParkingFee a partir de input do usuário.
 * Valida as regras de negócio — lança Error se o estado for inválido.
 */
export function createParkingFee(params: CreateParkingFeeParams): ParkingFee {
  if (params.amountCents <= 0) {
    throw new Error('O valor do estacionamento deve ser maior que zero')
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
 * Transforma um ParkingFeeDTO vindo da API em entidade de domínio.
 */
export function hydrateParkingFee(dto: ParkingFeeDTO): ParkingFee {
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
export function buildParkingFee(values: ParkingFeeFormValues): CreateParkingFeeParams {
  const normalized = values.amountR$.replace(',', '.')
  const amount = parseFloat(normalized)
  if (isNaN(amount)) {
    throw new Error('Valor inválido')
  }

  const params: CreateParkingFeeParams = {
    date: values.date,
    amountCents: Math.round(amount * 100),
    description: values.description,
  }

  createParkingFee(params)

  return params
}
