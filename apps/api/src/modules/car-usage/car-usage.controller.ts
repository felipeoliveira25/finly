import type { Request, Response } from 'express'
import { AppError } from '../../shared/errors'
import * as service from './car-usage.service'

function handleError(err: unknown, res: Response): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}

// --- CONFIGS ---

export async function getConfigs(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listConfigs()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createConfig(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.createConfig(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getActiveConfig(req: Request, res: Response): Promise<void> {
  try {
    const date = typeof req.query.date === 'string' ? req.query.date : new Date().toISOString().slice(0, 10)
    const result = await service.getActiveConfig(date)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

// --- FIXED ROUTES ---

export async function getFixedRoutes(req: Request, res: Response): Promise<void> {
  try {
    const onlyActive = req.query.onlyActive === 'true'
    const result = await service.listFixedRoutes(onlyActive)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createFixedRoute(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.createFixedRoute(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function updateFixedRoute(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    const result = await service.updateFixedRoute(id, req.body)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function archiveFixedRoute(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    await service.archiveFixedRoute(id)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
}

// --- TRIPS ---

export async function getTrips(req: Request, res: Response): Promise<void> {
  try {
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined
    const result = await service.listTrips({ startDate, endDate })
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createTrip(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.registerTrip(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function deleteTrip(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    await service.deleteTrip(id)
    res.status(204).send()
  } catch (err) {
    handleError(err, res)
  }
}

// --- PERIODS ---

export async function getPeriods(_req: Request, res: Response): Promise<void> {
  try {
    const result = await service.listPeriods()
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function createPeriod(req: Request, res: Response): Promise<void> {
  try {
    const result = await service.closePeriod(req.body)
    res.status(201).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

export async function getPeriodDetail(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id)
    const result = await service.getPeriodById(id)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}

// --- REPORT ---

export async function getReport(req: Request, res: Response): Promise<void> {
  try {
    const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : ''
    const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : ''
    if (!startDate || !endDate) {
      res.status(400).json({ error: 'startDate e endDate são obrigatórios' })
      return
    }
    const result = await service.getReport(startDate, endDate)
    res.status(200).json(result)
  } catch (err) {
    handleError(err, res)
  }
}
