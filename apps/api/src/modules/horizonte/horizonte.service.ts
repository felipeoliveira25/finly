import type { TripExpenseDTO, CreateTripExpenseDTO } from '@finly/shared-types'
import { AppError } from '../../shared/errors'
import {
  dbFindAllTripExpenses,
  dbFindTripExpenseById,
  dbCreateTripExpense,
  dbUpdateTripExpensePaid,
  dbDeleteTripExpense,
} from './horizonte.repository'
import type { TripExpenseRecord } from './horizonte.repository'

function toDTO(record: TripExpenseRecord): TripExpenseDTO {
  return {
    id: record.id,
    desc: record.desc,
    cat: record.cat,
    valorCents: record.valorCents,
    data: record.data,
    parcelas: record.parcelas,
    paid: record.paid,
    createdAt: record.createdAt,
  }
}

export async function listExpenses(): Promise<TripExpenseDTO[]> {
  const records = await dbFindAllTripExpenses()
  return records.map(toDTO)
}

export async function createExpense(dto: CreateTripExpenseDTO): Promise<TripExpenseDTO> {
  if (dto.valorCents <= 0) {
    throw new AppError('valorCents deve ser maior que zero', 400)
  }
  if (dto.parcelas < 1) {
    throw new AppError('parcelas deve ser pelo menos 1', 400)
  }
  if (!dto.desc || dto.desc.trim().length === 0) {
    throw new AppError('desc não pode ser vazio', 400)
  }
  if (!dto.data || !/^\d{4}-\d{2}-\d{2}$/.test(dto.data)) {
    throw new AppError('data deve ser uma data válida no formato YYYY-MM-DD', 400)
  }

  const record = await dbCreateTripExpense({
    desc: dto.desc.trim(),
    cat: dto.cat,
    valorCents: dto.valorCents,
    data: dto.data,
    parcelas: dto.parcelas,
    createdAt: new Date().toISOString(),
  })
  return toDTO(record)
}

export async function updatePaid(
  id: number,
  parcelaIndex: number,
  paid: boolean,
): Promise<TripExpenseDTO> {
  const existing = await dbFindTripExpenseById(id)
  if (!existing) {
    throw new AppError('Gasto não encontrado', 404)
  }
  if (parcelaIndex < 0 || parcelaIndex >= existing.parcelas) {
    throw new AppError('parcelaIndex fora do intervalo válido', 400)
  }

  const record = await dbUpdateTripExpensePaid(id, parcelaIndex, paid)
  if (!record) {
    throw new AppError('Erro ao atualizar gasto', 500)
  }
  return toDTO(record)
}

export async function deleteExpense(id: number): Promise<void> {
  const existing = await dbFindTripExpenseById(id)
  if (!existing) {
    throw new AppError('Gasto não encontrado', 404)
  }
  await dbDeleteTripExpense(id)
}
