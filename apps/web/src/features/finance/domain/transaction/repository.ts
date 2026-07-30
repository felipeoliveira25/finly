import type { Transaction } from './model'
import type { CreateTransactionDTO, UpdateTransactionDTO } from '@finly/shared-types'

export interface ITransactionRepository {
  findByMonth(monthKey: string): Promise<Transaction[]>
  create(data: CreateTransactionDTO): Promise<Transaction>
  update(id: number, data: UpdateTransactionDTO): Promise<Transaction>
  remove(id: number): Promise<void>
  generateRecurring(monthKey: string): Promise<{ generated: number }>
}
