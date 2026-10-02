import { eq, asc } from 'drizzle-orm'
import { db } from '../../db/client'
import { tripExpenses } from '../../db/schema'

type TripExpenseRow = typeof tripExpenses.$inferSelect

export interface TripExpenseRecord {
  id: number
  desc: string
  cat: string
  valorCents: number
  data: string
  parcelas: number
  paid: boolean[]
  createdAt: string
}

function parseRow(row: TripExpenseRow): TripExpenseRecord {
  return {
    id: row.id,
    desc: row.desc,
    cat: row.cat,
    valorCents: row.valorCents,
    data: row.data,
    parcelas: row.parcelas,
    paid: JSON.parse(row.paid) as boolean[],
    createdAt: row.createdAt,
  }
}

export async function dbFindAllTripExpenses(): Promise<TripExpenseRecord[]> {
  const rows = await db
    .select()
    .from(tripExpenses)
    .orderBy(asc(tripExpenses.data), asc(tripExpenses.createdAt))
  return rows.map(parseRow)
}

export async function dbFindTripExpenseById(id: number): Promise<TripExpenseRecord | null> {
  const rows = await db.select().from(tripExpenses).where(eq(tripExpenses.id, id))
  const row = rows[0]
  if (!row) return null
  return parseRow(row)
}

export async function dbCreateTripExpense(data: {
  desc: string
  cat: string
  valorCents: number
  data: string
  parcelas: number
  createdAt: string
}): Promise<TripExpenseRecord> {
  const paid = JSON.stringify(new Array(data.parcelas).fill(false))
  const [row] = await db
    .insert(tripExpenses)
    .values({ ...data, paid })
    .returning()
  return parseRow(row)
}

export async function dbUpdateTripExpensePaid(
  id: number,
  parcelaIndex: number,
  paidValue: boolean,
): Promise<TripExpenseRecord | null> {
  const existing = await dbFindTripExpenseById(id)
  if (!existing) return null

  const updatedPaid = [...existing.paid]
  updatedPaid[parcelaIndex] = paidValue

  const [row] = await db
    .update(tripExpenses)
    .set({ paid: JSON.stringify(updatedPaid) })
    .where(eq(tripExpenses.id, id))
    .returning()
  return parseRow(row)
}

export async function dbDeleteTripExpense(id: number): Promise<void> {
  await db.delete(tripExpenses).where(eq(tripExpenses.id, id))
}
