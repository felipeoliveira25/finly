import type { Request, Response } from 'express'
import { AppError } from '../../shared/errors'
import * as service from './finance.service'

function handleError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listCategories()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.createCategory(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function deleteCategory(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    await service.deleteCategory(id)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
}

// ─── Recurring Models ─────────────────────────────────────────────────────────

export async function getModels(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listModels()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createModel(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.createModel(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function updateModel(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    const result = await service.updateModel(id, req.body)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function archiveModel(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    const result = await service.archiveModel(id)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

// ─── Transactions ─────────────────────────────────────────────────────────────

export async function getTransactions(req: Request, res: Response): Promise<void> {
  try {
    const monthKey = typeof req.query.monthKey === 'string' ? req.query.monthKey : ''
    if (!monthKey) {
      res.status(400).json({ error: 'O parâmetro monthKey é obrigatório' })
      return
    }
    const result = await service.listTransactions(monthKey)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.createTransaction(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function updateTransaction(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    const result = await service.updateTransaction(id, req.body)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function deleteTransaction(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    await service.deleteTransaction(id)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
}

export async function generateRecurring(req: Request, res: Response): Promise<void> {
  try {
    const monthKey = req.params.monthKey
    const result = await service.generateRecurringForMonth(monthKey)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export async function getMonthlySummary(req: Request, res: Response): Promise<void> {
  try {
    const monthKey = req.params.monthKey
    const result = await service.getMonthlySummary(monthKey)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}
