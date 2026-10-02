import type { TripExpenseDTO } from '@finly/shared-types'
import type { TripExpense, CreateTripExpenseInput } from './model'

/**
 * Transforma um TripExpenseDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateTripExpense(dto: TripExpenseDTO): TripExpense {
  return {
    id: dto.id,
    desc: dto.desc,
    cat: dto.cat,
    valorCents: dto.valorCents,
    data: dto.data,
    parcelas: dto.parcelas,
    paid: dto.paid,
    createdAt: dto.createdAt,
  }
}

interface TripExpenseFormValues {
  desc: string
  cat: string
  valorReais: string
  data: string
  parcelas: string
}

/**
 * Converte os valores brutos do formulário em CreateTripExpenseInput validado.
 * Converte valorReais (string) → valorCents (integer).
 * Lança Error se o estado for inválido.
 */
export function buildCreateInput(form: TripExpenseFormValues): CreateTripExpenseInput {
  if (!form.desc || form.desc.trim().length === 0) {
    throw new Error('Descrição não pode ser vazia')
  }
  const valorReais = parseFloat(form.valorReais.replace(',', '.'))
  if (isNaN(valorReais) || valorReais <= 0) {
    throw new Error('Valor deve ser maior que zero')
  }
  const valorCents = Math.round(valorReais * 100)

  const parcelas = parseInt(form.parcelas, 10)
  if (isNaN(parcelas) || parcelas < 1) {
    throw new Error('Parcelas deve ser pelo menos 1')
  }

  if (!form.data || !/^\d{4}-\d{2}-\d{2}$/.test(form.data)) {
    throw new Error('Data inválida')
  }

  return {
    desc: form.desc.trim(),
    cat: form.cat,
    valorCents,
    data: form.data,
    parcelas,
  }
}
