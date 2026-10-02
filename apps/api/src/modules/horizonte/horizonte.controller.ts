import type { Request, Response } from 'express'
import { AppError } from '../../shared/errors'
import * as service from './horizonte.service'

function handleError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export async function getExpenses(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listExpenses()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createExpense(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.createExpense(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function updatePaid(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    const { parcelaIndex, paid } = req.body as { parcelaIndex: number; paid: boolean }
    const result = await service.updatePaid(id, parcelaIndex, paid)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function deleteExpense(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    await service.deleteExpense(id)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
}
