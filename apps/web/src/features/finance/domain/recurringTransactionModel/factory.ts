import type { TransactionType, RecurringTransactionModelDTO } from '@finly/shared-types'
import type { RecurringTransactionModel } from './model'

interface CreateRecurringModelParams {
  name: string
  type: TransactionType
  categoryId: number
  defaultAmountCents: number
  dayOfMonth: number
}

interface RecurringModelFormValues {
  name: string
  type: TransactionType
  categoryId: number
  defaultAmountReais: string  // ex: "3000.00" → 300000 cents
  dayOfMonth: string          // ex: "5" → 5
}

/**
 * Constrói e valida os parâmetros de um modelo de transação recorrente a partir de input do usuário.
 * Lança Error se qualquer regra de negócio for violada.
 */
export function createRecurringTransactionModel(
  params: CreateRecurringModelParams,
): CreateRecurringModelParams {
  if (params.name.trim() === '') {
    throw new Error('Nome não pode ser vazio')
  }

  if (params.defaultAmountCents <= 0) {
    throw new Error('Valor padrão deve ser maior que zero')
  }

  if (params.dayOfMonth < 1 || params.dayOfMonth > 31) {
    throw new Error('Dia do mês deve ser entre 1 e 31')
  }

  return params
}

/**
 * Transforma um RecurringTransactionModelDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateRecurringTransactionModel(
  dto: RecurringTransactionModelDTO,
): RecurringTransactionModel {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    defaultAmountCents: dto.defaultAmountCents,
    dayOfMonth: dto.dayOfMonth,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateRecurringModelParams validados.
 * Converte defaultAmountReais (string) para cents (integer) e dayOfMonth (string) para number.
 */
export function buildRecurringTransactionModel(
  values: RecurringModelFormValues,
): CreateRecurringModelParams {
  const amountFloat = parseFloat(values.defaultAmountReais)
  if (isNaN(amountFloat)) {
    throw new Error('Valor inválido')
  }

  const dayOfMonth = parseInt(values.dayOfMonth, 10)
  if (isNaN(dayOfMonth)) {
    throw new Error('Dia inválido')
  }

  const params: CreateRecurringModelParams = {
    name: values.name,
    type: values.type,
    categoryId: values.categoryId,
    defaultAmountCents: Math.round(amountFloat * 100),
    dayOfMonth,
  }

  return createRecurringTransactionModel(params)
}
