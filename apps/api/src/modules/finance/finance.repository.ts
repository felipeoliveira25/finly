import { eq, and, desc, asc, sql } from 'drizzle-orm'
import { db } from '../../db/client'
import { financeCategories, recurringTransactionModels, transactions } from '../../db/schema'

type CategoryRow = typeof financeCategories.$inferSelect
type ModelRow = typeof recurringTransactionModels.$inferSelect
type TransactionRow = typeof transactions.$inferSelect

type ModelWithCategory = ModelRow & { categoryName: string }
type TransactionWithJoins = TransactionRow & {
  categoryName: string
  recurringModelName: string | null
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function dbFindAllCategories(): Promise<CategoryRow[]> {
  return db
    .select()
    .from(financeCategories)
    .orderBy(desc(financeCategories.isSystem), asc(financeCategories.name))
}

export async function dbFindCategoryById(id: number): Promise<CategoryRow | null> {
  const rows = await db
    .select()
    .from(financeCategories)
    .where(eq(financeCategories.id, id))
  return rows[0] ?? null
}

export async function dbCreateCategory(data: {
  name: string
  createdAt: string
}): Promise<CategoryRow> {
  const [row] = await db.insert(financeCategories).values(data).returning()
  return row
}

export async function dbDeleteCategory(id: number): Promise<void> {
  await db.delete(financeCategories).where(eq(financeCategories.id, id))
}

// ─── Recurring Models ─────────────────────────────────────────────────────────

export async function dbFindAllModels(): Promise<ModelWithCategory[]> {
  const rows = await db
    .select({
      id: recurringTransactionModels.id,
      name: recurringTransactionModels.name,
      type: recurringTransactionModels.type,
      categoryId: recurringTransactionModels.categoryId,
      defaultAmountCents: recurringTransactionModels.defaultAmountCents,
      dayOfMonth: recurringTransactionModels.dayOfMonth,
      isActive: recurringTransactionModels.isActive,
      createdAt: recurringTransactionModels.createdAt,
      updatedAt: recurringTransactionModels.updatedAt,
      categoryName: financeCategories.name,
    })
    .from(recurringTransactionModels)
    .leftJoin(
      financeCategories,
      eq(recurringTransactionModels.categoryId, financeCategories.id),
    )
    .orderBy(asc(recurringTransactionModels.name))

  return rows.map((r) => ({ ...r, categoryName: r.categoryName ?? '' }))
}

export async function dbFindActiveModels(): Promise<ModelWithCategory[]> {
  const rows = await db
    .select({
      id: recurringTransactionModels.id,
      name: recurringTransactionModels.name,
      type: recurringTransactionModels.type,
      categoryId: recurringTransactionModels.categoryId,
      defaultAmountCents: recurringTransactionModels.defaultAmountCents,
      dayOfMonth: recurringTransactionModels.dayOfMonth,
      isActive: recurringTransactionModels.isActive,
      createdAt: recurringTransactionModels.createdAt,
      updatedAt: recurringTransactionModels.updatedAt,
      categoryName: financeCategories.name,
    })
    .from(recurringTransactionModels)
    .leftJoin(
      financeCategories,
      eq(recurringTransactionModels.categoryId, financeCategories.id),
    )
    .where(eq(recurringTransactionModels.isActive, true))
    .orderBy(asc(recurringTransactionModels.name))

  return rows.map((r) => ({ ...r, categoryName: r.categoryName ?? '' }))
}

export async function dbFindModelById(id: number): Promise<ModelWithCategory | null> {
  const rows = await db
    .select({
      id: recurringTransactionModels.id,
      name: recurringTransactionModels.name,
      type: recurringTransactionModels.type,
      categoryId: recurringTransactionModels.categoryId,
      defaultAmountCents: recurringTransactionModels.defaultAmountCents,
      dayOfMonth: recurringTransactionModels.dayOfMonth,
      isActive: recurringTransactionModels.isActive,
      createdAt: recurringTransactionModels.createdAt,
      updatedAt: recurringTransactionModels.updatedAt,
      categoryName: financeCategories.name,
    })
    .from(recurringTransactionModels)
    .leftJoin(
      financeCategories,
      eq(recurringTransactionModels.categoryId, financeCategories.id),
    )
    .where(eq(recurringTransactionModels.id, id))

  const row = rows[0]
  if (!row) return null
  return { ...row, categoryName: row.categoryName ?? '' }
}

export async function dbCreateModel(data: {
  name: string
  type: 'income' | 'expense'
  categoryId: number
  defaultAmountCents: number
  dayOfMonth: number
  createdAt: string
  updatedAt: string
}): Promise<ModelRow> {
  const [row] = await db.insert(recurringTransactionModels).values(data).returning()
  return row
}

export async function dbUpdateModel(
  id: number,
  data: {
    name?: string
    categoryId?: number
    defaultAmountCents?: number
    dayOfMonth?: number
    isActive?: boolean
    updatedAt: string
  },
): Promise<ModelRow | null> {
  const [row] = await db
    .update(recurringTransactionModels)
    .set(data)
    .where(eq(recurringTransactionModels.id, id))
    .returning()
  return row ?? null
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function dbFindTransactionsByMonth(monthKey: string): Promise<TransactionWithJoins[]> {
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      categoryId: transactions.categoryId,
      amountCents: transactions.amountCents,
      description: transactions.description,
      date: transactions.date,
      monthKey: transactions.monthKey,
      recurringModelId: transactions.recurringModelId,
      isConfirmed: transactions.isConfirmed,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      categoryName: financeCategories.name,
      recurringModelName: recurringTransactionModels.name,
    })
    .from(transactions)
    .leftJoin(financeCategories, eq(transactions.categoryId, financeCategories.id))
    .leftJoin(
      recurringTransactionModels,
      eq(transactions.recurringModelId, recurringTransactionModels.id),
    )
    .where(eq(transactions.monthKey, monthKey))
    .orderBy(asc(transactions.date), asc(transactions.createdAt))

  return rows.map((r) => ({
    ...r,
    categoryName: r.categoryName ?? '',
    recurringModelName: r.recurringModelName ?? null,
  }))
}

export async function dbFindTransactionById(id: number): Promise<TransactionWithJoins | null> {
  const rows = await db
    .select({
      id: transactions.id,
      type: transactions.type,
      categoryId: transactions.categoryId,
      amountCents: transactions.amountCents,
      description: transactions.description,
      date: transactions.date,
      monthKey: transactions.monthKey,
      recurringModelId: transactions.recurringModelId,
      isConfirmed: transactions.isConfirmed,
      createdAt: transactions.createdAt,
      updatedAt: transactions.updatedAt,
      categoryName: financeCategories.name,
      recurringModelName: recurringTransactionModels.name,
    })
    .from(transactions)
    .leftJoin(financeCategories, eq(transactions.categoryId, financeCategories.id))
    .leftJoin(
      recurringTransactionModels,
      eq(transactions.recurringModelId, recurringTransactionModels.id),
    )
    .where(eq(transactions.id, id))

  const row = rows[0]
  if (!row) return null
  return {
    ...row,
    categoryName: row.categoryName ?? '',
    recurringModelName: row.recurringModelName ?? null,
  }
}

export async function dbCreateTransaction(data: {
  type: 'income' | 'expense'
  categoryId: number
  amountCents: number
  description: string | null
  date: string
  monthKey: string
  recurringModelId: number | null
  isConfirmed: boolean
  createdAt: string
  updatedAt: string
}): Promise<TransactionRow> {
  const [row] = await db.insert(transactions).values(data).returning()
  return row
}

export async function dbUpdateTransaction(
  id: number,
  data: {
    amountCents?: number
    description?: string
    date?: string
    monthKey?: string
    categoryId?: number
    isConfirmed?: boolean
    updatedAt: string
  },
): Promise<TransactionRow | null> {
  const [row] = await db
    .update(transactions)
    .set(data)
    .where(eq(transactions.id, id))
    .returning()
  return row ?? null
}

export async function dbDeleteTransaction(id: number): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id))
}

export async function dbFindExistingRecurringInstance(
  recurringModelId: number,
  monthKey: string,
): Promise<TransactionRow | null> {
  const rows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.recurringModelId, recurringModelId),
        eq(transactions.monthKey, monthKey),
      ),
    )
  return rows[0] ?? null
}

// ─── Summary queries ──────────────────────────────────────────────────────────

export async function dbGetMonthTotals(
  monthKey: string,
): Promise<{ totalIncomeCents: number; totalExpensesCents: number }> {
  const rows = await db
    .select({
      type: transactions.type,
      total: sql<number>`sum(${transactions.amountCents})`,
    })
    .from(transactions)
    .where(eq(transactions.monthKey, monthKey))
    .groupBy(transactions.type)

  let totalIncomeCents = 0
  let totalExpensesCents = 0

  for (const row of rows) {
    if (row.type === 'income') {
      totalIncomeCents = row.total ?? 0
    } else {
      totalExpensesCents = row.total ?? 0
    }
  }

  return { totalIncomeCents, totalExpensesCents }
}

export async function dbGetCategoryBreakdown(monthKey: string): Promise<
  Array<{
    categoryId: number
    categoryName: string
    type: 'income' | 'expense'
    totalCents: number
    transactionCount: number
  }>
> {
  const rows = await db
    .select({
      categoryId: transactions.categoryId,
      categoryName: financeCategories.name,
      type: transactions.type,
      totalCents: sql<number>`sum(${transactions.amountCents})`,
      transactionCount: sql<number>`count(*)`,
    })
    .from(transactions)
    .innerJoin(financeCategories, eq(transactions.categoryId, financeCategories.id))
    .where(eq(transactions.monthKey, monthKey))
    .groupBy(transactions.categoryId, transactions.type)

  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: r.categoryName,
    type: r.type,
    totalCents: r.totalCents ?? 0,
    transactionCount: r.transactionCount ?? 0,
  }))
}

export async function dbCountPending(monthKey: string): Promise<number> {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(transactions)
    .where(
      and(
        eq(transactions.monthKey, monthKey),
        eq(transactions.isConfirmed, false),
      ),
    )
  return rows[0]?.count ?? 0
}
