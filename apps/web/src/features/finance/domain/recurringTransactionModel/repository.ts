import type { RecurringTransactionModel } from './model'
import type {
  CreateRecurringTransactionModelDTO,
  UpdateRecurringTransactionModelDTO,
} from '@finly/shared-types'

export interface IRecurringTransactionModelRepository {
  findAll(): Promise<RecurringTransactionModel[]>
  create(data: CreateRecurringTransactionModelDTO): Promise<RecurringTransactionModel>
  update(id: number, data: UpdateRecurringTransactionModelDTO): Promise<RecurringTransactionModel>
  archive(id: number): Promise<RecurringTransactionModel>
}
