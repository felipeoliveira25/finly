export type TransactionType = 'income' | 'expense'

export interface CategoryDTO {
  id: number
  name: string
  isSystem: boolean
  createdAt: string
}

export interface CreateCategoryDTO {
  name: string
}

export interface RecurringTransactionModelDTO {
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

export interface CreateRecurringTransactionModelDTO {
  name: string
  type: TransactionType
  categoryId: number
  defaultAmountCents: number
  dayOfMonth: number
}

export interface UpdateRecurringTransactionModelDTO {
  name?: string
  categoryId?: number
  defaultAmountCents?: number
  dayOfMonth?: number
  isActive?: boolean
}

export interface TransactionDTO {
  id: number
  type: TransactionType
  categoryId: number
  categoryName: string
  amountCents: number
  description: string | null
  date: string
  monthKey: string
  recurringModelId: number | null
  recurringModelName: string | null
  isConfirmed: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateTransactionDTO {
  type: TransactionType
  categoryId: number
  amountCents: number
  description?: string
  date: string
  // monthKey é derivado de date no servidor — não enviar pelo cliente
}

export interface UpdateTransactionDTO {
  amountCents?: number
  description?: string
  date?: string
  categoryId?: number
  isConfirmed?: boolean
}

export interface CategoryBreakdownDTO {
  categoryId: number
  categoryName: string
  type: TransactionType
  totalCents: number
  transactionCount: number
}

export interface PreviousMonthSummaryDTO {
  monthKey: string
  totalIncomeCents: number
  totalExpensesCents: number
  balanceCents: number
}

export interface MonthlySummaryDTO {
  monthKey: string
  totalIncomeCents: number
  totalExpensesCents: number
  balanceCents: number
  pendingCount: number          // lançamentos is_confirmed=0
  categoryBreakdown: CategoryBreakdownDTO[]
  previousMonth: PreviousMonthSummaryDTO | null
}

export interface GenerateRecurringResultDTO {
  monthKey: string
  generated: number
}
