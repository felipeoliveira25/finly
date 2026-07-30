import type { TransactionType } from '@finly/shared-types'

export interface RecurringTransactionModel {
  id: number
  name: string
  type: TransactionType
  categoryId: number
  categoryName: string
  defaultAmountCents: number
  dayOfMonth: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}
