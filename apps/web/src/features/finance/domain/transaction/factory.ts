import type { TransactionType, TransactionDTO } from '@finly/shared-types'
import type { Transaction } from './model'

interface CreateTransactionParams {
  type: TransactionType
  categoryId: number
  amountCents: number
  description?: string
  date: string
}

interface TransactionFormValues {
  type: TransactionType
  categoryId: number
  amountReais: string   // ex: "150.50" → 15050 cents
  description?: string
  date: string
}

interface ConfirmRecurringValues {
  amountReais: string   // para confirmar/ajustar valor de recorrente
}

/**
 * Constrói e valida os parâmetros de uma transação a partir de input do usuário.
 * Lança Error se qualquer regra de negócio for violada.
 */
export function createTransaction(params: CreateTransactionParams): CreateTransactionParams {
  if (params.amountCents <= 0) {
    throw new Error('Valor deve ser maior que zero')
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(params.date)) {
    throw new Error('Data inválida')
  }

  if (params.categoryId <= 0) {
    throw new Error('Categoria é obrigatória')
  }

  return params
}

/**
 * Transforma um TransactionDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateTransaction(dto: TransactionDTO): Transaction {
  return {
    id: dto.id,
    type: dto.type,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    amountCents: dto.amountCents,
    description: dto.description,
    date: dto.date,
    monthKey: dto.monthKey,
    recurringModelId: dto.recurringModelId,
    recurringModelName: dto.recurringModelName,
    isConfirmed: dto.isConfirmed,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateTransactionParams validados.
 * Converte amountReais (string) para amountCents (integer).
 */
export function buildTransaction(values: TransactionFormValues): CreateTransactionParams {
  const amountFloat = parseFloat(values.amountReais)
  if (isNaN(amountFloat)) {
    throw new Error('Valor inválido')
  }

  const params: CreateTransactionParams = {
    type: values.type,
    categoryId: values.categoryId,
    amountCents: Math.round(amountFloat * 100),
    description: values.description,
    date: values.date,
  }

  return createTransaction(params)
}

/**
 * Prepara os dados para confirmar (e opcionalmente ajustar o valor de) uma transação recorrente.
 * Lança Error se o valor for inválido ou não-positivo.
 */
export function buildConfirmRecurring(
  values: ConfirmRecurringValues,
): { amountCents: number; isConfirmed: true } {
  const amountFloat = parseFloat(values.amountReais)
  if (isNaN(amountFloat) || amountFloat <= 0) {
    throw new Error('Valor inválido')
  }

  const amountCents = Math.round(amountFloat * 100)

  return { amountCents, isConfirmed: true as const }
}
