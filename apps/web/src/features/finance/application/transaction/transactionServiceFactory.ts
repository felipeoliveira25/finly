import type { ITransactionRepository } from '../../domain/transaction/repository'
import { buildTransaction, buildConfirmRecurring } from '../../domain/transaction/factory'
import type { Transaction } from '../../domain/transaction/model'
import type { TransactionType } from '@finly/shared-types'

interface TransactionFormValues {
  type: TransactionType
  categoryId: number
  amountReais: string
  description?: string
  date: string
}

interface ConfirmRecurringValues {
  amountReais: string
}

export function makeListTransactionsService(repo: ITransactionRepository) {
  return { execute: (monthKey: string): Promise<Transaction[]> => repo.findByMonth(monthKey) }
}

export function makeCreateTransactionService(repo: ITransactionRepository) {
  return {
    execute: async (values: TransactionFormValues): Promise<Transaction> => {
      const params = buildTransaction(values)
      return repo.create(params)
    },
  }
}

export function makeConfirmRecurringService(repo: ITransactionRepository) {
  return {
    execute: async (id: number, values: ConfirmRecurringValues): Promise<Transaction> => {
      const dto = buildConfirmRecurring(values)
      return repo.update(id, dto)
    },
  }
}

export function makeDeleteTransactionService(repo: ITransactionRepository) {
  return { execute: (id: number): Promise<void> => repo.remove(id) }
}

export function makeGenerateRecurringService(repo: ITransactionRepository) {
  return {
    execute: (monthKey: string): Promise<{ generated: number }> =>
      repo.generateRecurring(monthKey),
  }
}
