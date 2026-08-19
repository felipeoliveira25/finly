import type { Request, Response } from 'express'
import { AppError } from '../../shared/errors'
import * as service from './investments.service'
import { runPortfolioSnapshotJob } from '../../jobs/portfolioSnapshot.job'

function handleError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

export async function getPortfolio(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.getPortfolio()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getSnapshots(req: Request, res: Response): Promise<void> {
  try {
    const limit = typeof req.query.limit === 'string' ? Number(req.query.limit) : 90
    const result = await service.listSnapshots(limit)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getStocks(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listStocks()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getTreasury(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listTreasury()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getOptions(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listOptions()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getCronStatus(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.getCronStatus()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function triggerSnapshot(_req: Request, res: Response): Promise<void> {
  try {
    await runPortfolioSnapshotJob()
    const snapshot = await service.getPortfolio()
    res.status(200).json({ ok: true, snapshot: snapshot.latestSnapshot })
  } catch (err) {
    handleError(err, res)
  }
}
