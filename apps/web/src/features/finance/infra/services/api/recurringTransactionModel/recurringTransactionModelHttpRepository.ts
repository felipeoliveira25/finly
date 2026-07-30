import { apiFetch } from '@/lib/api'
import type {
  RecurringTransactionModelDTO,
  CreateRecurringTransactionModelDTO,
  UpdateRecurringTransactionModelDTO,
} from '@finly/shared-types'
import { hydrateRecurringTransactionModel } from '../../../../domain/recurringTransactionModel/factory'
import type { IRecurringTransactionModelRepository } from '../../../../domain/recurringTransactionModel/repository'

export function makeRecurringTransactionModelHttpRepository(): IRecurringTransactionModelRepository {
  return {
    findAll: async () => {
      const dtos = await apiFetch<RecurringTransactionModelDTO[]>('/finance/recurring-models')
      return dtos.map(hydrateRecurringTransactionModel)
    },
    create: async (data: CreateRecurringTransactionModelDTO) => {
      const dto = await apiFetch<RecurringTransactionModelDTO>('/finance/recurring-models', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateRecurringTransactionModel(dto)
    },
    update: async (id, data: UpdateRecurringTransactionModelDTO) => {
      const dto = await apiFetch<RecurringTransactionModelDTO>(
        `/finance/recurring-models/${id}`,
        { method: 'PUT', body: JSON.stringify(data) },
      )
      return hydrateRecurringTransactionModel(dto)
    },
    archive: async (id) => {
      const dto = await apiFetch<RecurringTransactionModelDTO>(
        `/finance/recurring-models/${id}`,
        { method: 'DELETE' },
      )
      return hydrateRecurringTransactionModel(dto)
    },
  }
}
