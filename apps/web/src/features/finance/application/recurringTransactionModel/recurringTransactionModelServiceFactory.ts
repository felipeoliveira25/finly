import type { IRecurringTransactionModelRepository } from '../../domain/recurringTransactionModel/repository'
import { buildRecurringTransactionModel } from '../../domain/recurringTransactionModel/factory'
import type { RecurringTransactionModel } from '../../domain/recurringTransactionModel/model'
import type { TransactionType } from '@finly/shared-types'

interface RecurringModelFormValues {
  name: string
  type: TransactionType
  categoryId: number
  defaultAmountReais: string
  dayOfMonth: string
}

export function makeListModelsService(repo: IRecurringTransactionModelRepository) {
  return { execute: (): Promise<RecurringTransactionModel[]> => repo.findAll() }
}

export function makeCreateModelService(repo: IRecurringTransactionModelRepository) {
  return {
    execute: async (values: RecurringModelFormValues): Promise<RecurringTransactionModel> => {
      const params = buildRecurringTransactionModel(values)
      return repo.create(params)
    },
  }
}

export function makeUpdateModelService(repo: IRecurringTransactionModelRepository) {
  return {
    execute: async (
      id: number,
      values: Partial<RecurringModelFormValues>,
    ): Promise<RecurringTransactionModel> => {
      const dto: {
        name?: string
        categoryId?: number
        defaultAmountCents?: number
        dayOfMonth?: number
      } = {}
      if (values.name !== undefined) dto.name = values.name.trim()
      if (values.categoryId !== undefined) dto.categoryId = values.categoryId
      if (values.defaultAmountReais !== undefined) {
        const cents = Math.round(parseFloat(values.defaultAmountReais) * 100)
        if (isNaN(cents) || cents <= 0) throw new Error('Valor inválido')
        dto.defaultAmountCents = cents
      }
      if (values.dayOfMonth !== undefined) {
        const day = parseInt(values.dayOfMonth, 10)
        if (isNaN(day) || day < 1 || day > 31) throw new Error('Dia inválido')
        dto.dayOfMonth = day
      }
      return repo.update(id, dto)
    },
  }
}

export function makeArchiveModelService(repo: IRecurringTransactionModelRepository) {
  return { execute: (id: number): Promise<RecurringTransactionModel> => repo.archive(id) }
}
