import type { TransactionType } from '@finly/shared-types'

export interface CategoryBreakdown {
  categoryId: number
  categoryName: string
  type: TransactionType
  totalCents: number
  transactionCount: number
}

export interface PreviousMonthSummary {
  monthKey: string
  totalIncomeCents: number
  totalExpensesCents: number
  balanceCents: number
}

export interface MonthlySummary {
  monthKey: string
  totalIncomeCents: number
  totalExpensesCents: number
  balanceCents: number
  pendingCount: number
  categoryBreakdown: CategoryBreakdown[]
  previousMonth: PreviousMonthSummary | null
}
