import { apiFetch } from '@/lib/api'
import type {
  TransactionDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  GenerateRecurringResultDTO,
} from '@finly/shared-types'
import { hydrateTransaction } from '../../../../domain/transaction/factory'
import type { ITransactionRepository } from '../../../../domain/transaction/repository'

export function makeTransactionHttpRepository(): ITransactionRepository {
  return {
    findByMonth: async (monthKey: string) => {
      const dtos = await apiFetch<TransactionDTO[]>(
        `/finance/transactions?monthKey=${monthKey}`,
      )
      return dtos.map(hydrateTransaction)
    },
    create: async (data: CreateTransactionDTO) => {
      const dto = await apiFetch<TransactionDTO>('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateTransaction(dto)
    },
    update: async (id, data: UpdateTransactionDTO) => {
      const dto = await apiFetch<TransactionDTO>(`/finance/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return hydrateTransaction(dto)
    },
    remove: async (id) => {
      await apiFetch<void>(`/finance/transactions/${id}`, { method: 'DELETE' })
    },
    generateRecurring: async (monthKey: string) => {
      const result = await apiFetch<GenerateRecurringResultDTO>(
        `/finance/transactions/generate/${monthKey}`,
        { method: 'POST' },
      )
      return { generated: result.generated }
    },
  }
}
