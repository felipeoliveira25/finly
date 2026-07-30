import type { TransactionType } from '@finly/shared-types'

export interface Transaction {
  id: number
  type: TransactionType
  categoryId: number
  categoryName: string
  amountCents: number
  description: string | null
  date: string      // 'YYYY-MM-DD'
  monthKey: string  // 'YYYY-MM'
  recurringModelId: number | null
  recurringModelName: string | null
  isConfirmed: boolean
  createdAt: string
  updatedAt: string
}

export function isRecurring(tx: Transaction): boolean {
  return tx.recurringModelId !== null
}

export function isPending(tx: Transaction): boolean {
  return !tx.isConfirmed
}
