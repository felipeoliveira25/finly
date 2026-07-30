import type {
  CategoryDTO,
  CreateCategoryDTO,
  RecurringTransactionModelDTO,
  CreateRecurringTransactionModelDTO,
  UpdateRecurringTransactionModelDTO,
  TransactionDTO,
  CreateTransactionDTO,
  UpdateTransactionDTO,
  MonthlySummaryDTO,
  GenerateRecurringResultDTO,
} from '@finly/shared-types'
import { AppError } from '../../shared/errors'
import {
  dbFindAllCategories,
  dbFindCategoryById,
  dbCreateCategory,
  dbDeleteCategory,
  dbFindAllModels,
  dbFindActiveModels,
  dbFindModelById,
  dbCreateModel,
  dbUpdateModel,
  dbFindTransactionsByMonth,
  dbFindTransactionById,
  dbCreateTransaction,
  dbUpdateTransaction,
  dbDeleteTransaction,
  dbFindExistingRecurringInstance,
  dbGetMonthTotals,
  dbGetCategoryBreakdown,
  dbCountPending,
} from './finance.repository'

// ─── Internal types ───────────────────────────────────────────────────────────

type CategoryRow = {
  id: number
  name: string
  isSystem: boolean
  createdAt: string
}

type ModelWithCategory = {
  id: number
  name: string
  type: 'income' | 'expense'
  categoryId: number
  defaultAmountCents: number
  dayOfMonth: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  categoryName: string
}

type TransactionWithJoins = {
  id: number
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
  categoryName: string
  recurringModelName: string | null
}

// ─── Auxiliary functions ──────────────────────────────────────────────────────

function computeMonthKey(date: string): string {
  return date.slice(0, 7) // '2025-07-15' → '2025-07'
}

function computeRecurringDate(monthKey: string, dayOfMonth: number): string {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const lastDay = new Date(year, month, 0).getDate()
  const day = Math.min(dayOfMonth, lastDay)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function previousMonthKey(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  if (month === 1) return `${year - 1}-12`
  return `${year}-${String(month - 1).padStart(2, '0')}`
}

// ─── DTO mappers ──────────────────────────────────────────────────────────────

function toCategoryDTO(row: CategoryRow): CategoryDTO {
  return {
    id: row.id,
    name: row.name,
    isSystem: row.isSystem,
    createdAt: row.createdAt,
  }
}

function toModelDTO(row: ModelWithCategory): RecurringTransactionModelDTO {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    defaultAmountCents: row.defaultAmountCents,
    dayOfMonth: row.dayOfMonth,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toTransactionDTO(row: TransactionWithJoins): TransactionDTO {
  return {
    id: row.id,
    type: row.type,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    amountCents: row.amountCents,
    description: row.description,
    date: row.date,
    monthKey: row.monthKey,
    recurringModelId: row.recurringModelId,
    recurringModelName: row.recurringModelName,
    isConfirmed: row.isConfirmed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function listCategories(): Promise<CategoryDTO[]> {
  const rows = await dbFindAllCategories()
  return rows.map(toCategoryDTO)
}

export async function createCategory(dto: CreateCategoryDTO): Promise<CategoryDTO> {
  const name = dto.name.trim()
  if (!name) {
    throw new AppError('O nome da categoria não pode ser vazio', 400)
  }

  try {
    const now = new Date().toISOString()
    const row = await dbCreateCategory({ name, createdAt: now })
    return toCategoryDTO(row)
  } catch (err) {
    if (
      err instanceof Error &&
      (err.message.includes('UNIQUE') || err.message.includes('unique'))
    ) {
      throw new AppError('Já existe uma categoria com este nome', 409)
    }
    throw err
  }
}

export async function deleteCategory(id: number): Promise<void> {
  const existing = await dbFindCategoryById(id)
  if (!existing) {
    throw new AppError('Categoria não encontrada', 404)
  }
  if (existing.isSystem) {
    throw new AppError('Categoria do sistema não pode ser removida', 403)
  }
  await dbDeleteCategory(id)
}

// ─── Recurring Models ─────────────────────────────────────────────────────────

export async function listModels(): Promise<RecurringTransactionModelDTO[]> {
  const rows = await dbFindAllModels()
  return rows.map(toModelDTO)
}

export async function createModel(
  dto: CreateRecurringTransactionModelDTO,
): Promise<RecurringTransactionModelDTO> {
  const name = dto.name.trim()
  if (!name) {
    throw new AppError('O nome do modelo não pode ser vazio', 400)
  }
  if (dto.defaultAmountCents <= 0) {
    throw new AppError('O valor padrão deve ser maior que zero', 400)
  }
  if (dto.dayOfMonth < 1 || dto.dayOfMonth > 31) {
    throw new AppError('O dia do mês deve estar entre 1 e 31', 400)
  }

  const category = await dbFindCategoryById(dto.categoryId)
  if (!category) {
    throw new AppError('Categoria não encontrada', 404)
  }

  const now = new Date().toISOString()
  const row = await dbCreateModel({
    name,
    type: dto.type,
    categoryId: dto.categoryId,
    defaultAmountCents: dto.defaultAmountCents,
    dayOfMonth: dto.dayOfMonth,
    createdAt: now,
    updatedAt: now,
  })

  const modelWithCategory = await dbFindModelById(row.id)
  if (!modelWithCategory) {
    throw new AppError('Erro ao buscar modelo criado', 500)
  }
  return toModelDTO(modelWithCategory)
}

export async function updateModel(
  id: number,
  dto: UpdateRecurringTransactionModelDTO,
): Promise<RecurringTransactionModelDTO> {
  const existing = await dbFindModelById(id)
  if (!existing) {
    throw new AppError('Modelo de lançamento recorrente não encontrado', 404)
  }

  if (dto.categoryId !== undefined) {
    const category = await dbFindCategoryById(dto.categoryId)
    if (!category) {
      throw new AppError('Categoria não encontrada', 404)
    }
  }

  if (dto.defaultAmountCents !== undefined && dto.defaultAmountCents <= 0) {
    throw new AppError('O valor padrão deve ser maior que zero', 400)
  }

  if (dto.dayOfMonth !== undefined && (dto.dayOfMonth < 1 || dto.dayOfMonth > 31)) {
    throw new AppError('O dia do mês deve estar entre 1 e 31', 400)
  }

  const now = new Date().toISOString()
  const updated = await dbUpdateModel(id, {
    ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
    ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
    ...(dto.defaultAmountCents !== undefined ? { defaultAmountCents: dto.defaultAmountCents } : {}),
    ...(dto.dayOfMonth !== undefined ? { dayOfMonth: dto.dayOfMonth } : {}),
    ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
    updatedAt: now,
  })

  if (!updated) {
    throw new AppError('Erro ao atualizar modelo', 500)
  }

  const modelWithCategory = await dbFindModelById(id)
  if (!modelWithCategory) {
    throw new AppError('Erro ao buscar modelo atualizado', 500)
  }
  return toModelDTO(modelWithCategory)
}

export async function archiveModel(id: number): Promise<RecurringTransactionModelDTO> {
  const existing = await dbFindModelById(id)
  if (!existing) {
    throw new AppError('Modelo de lançamento recorrente não encontrado', 404)
  }

  const now = new Date().toISOString()
  await dbUpdateModel(id, { isActive: false, updatedAt: now })

  const modelWithCategory = await dbFindModelById(id)
  if (!modelWithCategory) {
    throw new AppError('Erro ao buscar modelo arquivado', 500)
  }
  return toModelDTO(modelWithCategory)
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function listTransactions(monthKey: string): Promise<TransactionDTO[]> {
  const rows = await dbFindTransactionsByMonth(monthKey)
  return rows.map(toTransactionDTO)
}

export async function createTransaction(dto: CreateTransactionDTO): Promise<TransactionDTO> {
  if (dto.amountCents <= 0) {
    throw new AppError('O valor deve ser maior que zero', 400)
  }
  if (!dto.date || !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
    throw new AppError('Data inválida. Use o formato YYYY-MM-DD', 400)
  }

  const category = await dbFindCategoryById(dto.categoryId)
  if (!category) {
    throw new AppError('Categoria não encontrada', 404)
  }

  const monthKey = computeMonthKey(dto.date)
  const now = new Date().toISOString()

  const row = await dbCreateTransaction({
    type: dto.type,
    categoryId: dto.categoryId,
    amountCents: dto.amountCents,
    description: dto.description ?? null,
    date: dto.date,
    monthKey,
    recurringModelId: null,
    isConfirmed: true,
    createdAt: now,
    updatedAt: now,
  })

  const full = await dbFindTransactionById(row.id)
  if (!full) {
    throw new AppError('Erro ao buscar transação criada', 500)
  }
  return toTransactionDTO(full)
}

export async function updateTransaction(
  id: number,
  dto: UpdateTransactionDTO,
): Promise<TransactionDTO> {
  const existing = await dbFindTransactionById(id)
  if (!existing) {
    throw new AppError('Transação não encontrada', 404)
  }

  if (dto.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
    throw new AppError('Data inválida. Use o formato YYYY-MM-DD', 400)
  }

  if (dto.categoryId !== undefined) {
    const category = await dbFindCategoryById(dto.categoryId)
    if (!category) {
      throw new AppError('Categoria não encontrada', 404)
    }
  }

  if (dto.amountCents !== undefined && dto.amountCents <= 0) {
    throw new AppError('O valor deve ser maior que zero', 400)
  }

  const monthKey = dto.date !== undefined ? computeMonthKey(dto.date) : undefined
  const now = new Date().toISOString()

  await dbUpdateTransaction(id, {
    ...(dto.amountCents !== undefined ? { amountCents: dto.amountCents } : {}),
    ...(dto.description !== undefined ? { description: dto.description } : {}),
    ...(dto.date !== undefined ? { date: dto.date } : {}),
    ...(monthKey !== undefined ? { monthKey } : {}),
    ...(dto.categoryId !== undefined ? { categoryId: dto.categoryId } : {}),
    ...(dto.isConfirmed !== undefined ? { isConfirmed: dto.isConfirmed } : {}),
    updatedAt: now,
  })

  const full = await dbFindTransactionById(id)
  if (!full) {
    throw new AppError('Erro ao buscar transação atualizada', 500)
  }
  return toTransactionDTO(full)
}

export async function deleteTransaction(id: number): Promise<void> {
  const existing = await dbFindTransactionById(id)
  if (!existing) {
    throw new AppError('Transação não encontrada', 404)
  }
  await dbDeleteTransaction(id)
}

export async function generateRecurringForMonth(
  monthKey: string,
): Promise<GenerateRecurringResultDTO> {
  if (!/^\d{4}-\d{2}$/.test(monthKey)) {
    throw new AppError('Formato de monthKey inválido. Use YYYY-MM', 400)
  }

  const activeModels = await dbFindActiveModels()
  let generated = 0
  const now = new Date().toISOString()

  for (const model of activeModels) {
    const existing = await dbFindExistingRecurringInstance(model.id, monthKey)
    if (!existing) {
      const date = computeRecurringDate(monthKey, model.dayOfMonth)
      await dbCreateTransaction({
        type: model.type,
        categoryId: model.categoryId,
        amountCents: model.defaultAmountCents,
        description: null,
        date,
        monthKey,
        recurringModelId: model.id,
        isConfirmed: false,
        createdAt: now,
        updatedAt: now,
      })
      generated++
    }
  }

  return { monthKey, generated }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export async function getMonthlySummary(monthKey: string): Promise<MonthlySummaryDTO> {
  const { totalIncomeCents, totalExpensesCents } = await dbGetMonthTotals(monthKey)
  const categoryBreakdown = await dbGetCategoryBreakdown(monthKey)
  const pendingCount = await dbCountPending(monthKey)

  const prevKey = previousMonthKey(monthKey)
  const {
    totalIncomeCents: prevIncome,
    totalExpensesCents: prevExpenses,
  } = await dbGetMonthTotals(prevKey)

  const previousMonth =
    prevIncome > 0 || prevExpenses > 0
      ? {
          monthKey: prevKey,
          totalIncomeCents: prevIncome,
          totalExpensesCents: prevExpenses,
          balanceCents: prevIncome - prevExpenses,
        }
      : null

  return {
    monthKey,
    totalIncomeCents,
    totalExpensesCents,
    balanceCents: totalIncomeCents - totalExpensesCents,
    pendingCount,
    categoryBreakdown,
    previousMonth,
  }
}
