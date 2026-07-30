import type {
  CarUsageConfigDTO,
  CreateCarUsageConfigDTO,
  FixedRouteDTO,
  CreateFixedRouteDTO,
  UpdateFixedRouteDTO,
  CarTripDTO,
  CreateCarTripDTO,
  ReimbursementPeriodDTO,
  ClosePeriodDTO,
  CarUsageReportDTO,
  CarUsageDayBreakdownDTO,
} from '@finly/shared-types'
import { AppError } from '../../shared/errors'
import {
  dbFindAllConfigs,
  dbFindActiveConfig,
  dbCreateConfig,
  dbFindAllFixedRoutes,
  dbFindFixedRouteById,
  dbCreateFixedRoute,
  dbUpdateFixedRoute,
  dbDeactivateFixedRoute,
  dbFindTrips,
  dbFindTripById,
  dbCreateTrip,
  dbDeleteTrip,
  dbFindPeriodContainingDate,
  dbFindAllPeriods,
  dbFindPeriodById,
  dbCreatePeriod,
  dbAssignTripsToPeriod,
  dbFindTripsInRange,
} from './car-usage.repository'

// --- Mapper helpers ---

type ConfigRow = Awaited<ReturnType<typeof dbFindAllConfigs>>[number]
type FixedRouteRow = Awaited<ReturnType<typeof dbFindAllFixedRoutes>>[number]
type PeriodRow = Awaited<ReturnType<typeof dbFindAllPeriods>>[number]
type TripWithRoute = Awaited<ReturnType<typeof dbFindTrips>>[number]

function toConfigDTO(row: ConfigRow): CarUsageConfigDTO {
  return {
    id: row.id,
    pricePerLiterCents: row.pricePerLiterCents,
    avgConsumptionCdkm: row.avgConsumptionCdkm,
    effectiveFrom: row.effectiveFrom,
    createdAt: row.createdAt,
  }
}

function toFixedRouteDTO(row: FixedRouteRow): FixedRouteDTO {
  return {
    id: row.id,
    name: row.name,
    distanceMeters: row.distanceMeters,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toTripDTO(row: TripWithRoute): CarTripDTO {
  return {
    id: row.id,
    date: row.date,
    fixedRouteId: row.fixedRouteId ?? null,
    fixedRouteName: row.fixedRouteName ?? null,
    distanceMeters: row.distanceMeters,
    description: row.description ?? null,
    configId: row.configId,
    costCents: row.costCents,
    periodId: row.periodId ?? null,
    createdAt: row.createdAt,
  }
}

function toPeriodDTO(row: PeriodRow): ReimbursementPeriodDTO {
  return {
    id: row.id,
    label: row.label,
    startDate: row.startDate,
    endDate: row.endDate,
    totalKmMeters: row.totalKmMeters,
    totalCostCents: row.totalCostCents,
    closedAt: row.closedAt,
    createdAt: row.createdAt,
  }
}

// --- Cost calculation ---
// cost_cents = Math.round(pricePerLiterCents * distanceMeters / (avgConsumptionCdkm * 10))
function calculateCostCents(
  pricePerLiterCents: number,
  avgConsumptionCdkm: number,
  distanceMeters: number,
): number {
  return Math.round((pricePerLiterCents * distanceMeters) / (avgConsumptionCdkm * 10))
}

// --- CONFIGS ---

export async function listConfigs(): Promise<CarUsageConfigDTO[]> {
  const rows = await dbFindAllConfigs()
  return rows.map(toConfigDTO)
}

export async function createConfig(dto: CreateCarUsageConfigDTO): Promise<CarUsageConfigDTO> {
  if (dto.pricePerLiterCents <= 0) {
    throw new AppError('pricePerLiterCents deve ser maior que zero', 400)
  }
  if (dto.avgConsumptionCdkm <= 0) {
    throw new AppError('avgConsumptionCdkm deve ser maior que zero', 400)
  }
  if (!dto.effectiveFrom || !/^\d{4}-\d{2}-\d{2}$/.test(dto.effectiveFrom)) {
    throw new AppError('effectiveFrom deve ser uma data válida no formato YYYY-MM-DD', 400)
  }

  const row = await dbCreateConfig({
    pricePerLiterCents: dto.pricePerLiterCents,
    avgConsumptionCdkm: dto.avgConsumptionCdkm,
    effectiveFrom: dto.effectiveFrom,
    createdAt: new Date().toISOString(),
  })
  return toConfigDTO(row)
}

export async function getActiveConfig(date: string): Promise<CarUsageConfigDTO> {
  const row = await dbFindActiveConfig(date)
  if (!row) {
    throw new AppError('Nenhuma configuração cadastrada para esta data', 404)
  }
  return toConfigDTO(row)
}

// --- FIXED ROUTES ---

export async function listFixedRoutes(onlyActive?: boolean): Promise<FixedRouteDTO[]> {
  const rows = await dbFindAllFixedRoutes(onlyActive)
  return rows.map(toFixedRouteDTO)
}

export async function createFixedRoute(dto: CreateFixedRouteDTO): Promise<FixedRouteDTO> {
  if (!dto.name || dto.name.trim().length === 0) {
    throw new AppError('name não pode ser vazio', 400)
  }
  if (dto.distanceMeters <= 0) {
    throw new AppError('distanceMeters deve ser maior que zero', 400)
  }

  const now = new Date().toISOString()
  const row = await dbCreateFixedRoute({
    name: dto.name.trim(),
    distanceMeters: dto.distanceMeters,
    createdAt: now,
    updatedAt: now,
  })
  return toFixedRouteDTO(row)
}

export async function updateFixedRoute(
  id: number,
  dto: UpdateFixedRouteDTO,
): Promise<FixedRouteDTO> {
  const existing = await dbFindFixedRouteById(id)
  if (!existing) {
    throw new AppError('Trajeto fixo não encontrado', 404)
  }
  if (dto.distanceMeters !== undefined && dto.distanceMeters <= 0) {
    throw new AppError('distanceMeters deve ser maior que zero', 400)
  }

  const row = await dbUpdateFixedRoute(id, {
    ...dto,
    updatedAt: new Date().toISOString(),
  })
  if (!row) {
    throw new AppError('Trajeto fixo não encontrado', 404)
  }
  return toFixedRouteDTO(row)
}

export async function archiveFixedRoute(id: number): Promise<void> {
  const existing = await dbFindFixedRouteById(id)
  if (!existing) {
    throw new AppError('Trajeto fixo não encontrado', 404)
  }
  await dbDeactivateFixedRoute(id, new Date().toISOString())
}

// --- TRIPS ---

export async function listTrips(filters: {
  startDate?: string
  endDate?: string
}): Promise<CarTripDTO[]> {
  const rows = await dbFindTrips(filters)
  return rows.map(toTripDTO)
}

export async function registerTrip(dto: CreateCarTripDTO): Promise<CarTripDTO> {
  // 1. Verifica se a data está em período fechado
  const period = await dbFindPeriodContainingDate(dto.date)
  if (period) {
    throw new AppError('Data pertence a período fechado', 409)
  }

  // 2. Busca a config ativa para a data
  const config = await dbFindActiveConfig(dto.date)
  if (!config) {
    throw new AppError('Nenhuma configuração cadastrada para esta data', 404)
  }

  // 3. Calcula o custo
  const costCents = calculateCostCents(
    config.pricePerLiterCents,
    config.avgConsumptionCdkm,
    dto.distanceMeters,
  )

  // 4. Cria o trip no banco
  const tripRow = await dbCreateTrip({
    date: dto.date,
    fixedRouteId: dto.fixedRouteId ?? null,
    distanceMeters: dto.distanceMeters,
    description: dto.description ?? null,
    configId: config.id,
    costCents,
    createdAt: new Date().toISOString(),
  })

  // 5. Retorna com fixedRouteName via join
  const tripWithRoute = await dbFindTripById(tripRow.id)
  if (!tripWithRoute) {
    throw new AppError('Erro ao recuperar o registro criado', 500)
  }
  return toTripDTO(tripWithRoute)
}

export async function deleteTrip(id: number): Promise<void> {
  // 1. Busca o trip
  const trip = await dbFindTripById(id)
  if (!trip) {
    throw new AppError('Registro não encontrado', 404)
  }
  // 2. Verifica se pertence a período fechado
  if (trip.periodId !== null) {
    throw new AppError('Registro pertence a período fechado', 409)
  }
  // 3. Deleta
  await dbDeleteTrip(id)
}

// --- PERIODS ---

export async function listPeriods(): Promise<ReimbursementPeriodDTO[]> {
  const rows = await dbFindAllPeriods()
  return rows.map(toPeriodDTO)
}

export async function getPeriodById(
  id: number,
): Promise<ReimbursementPeriodDTO & { trips: CarTripDTO[] }> {
  const period = await dbFindPeriodById(id)
  if (!period) {
    throw new AppError('Período não encontrado', 404)
  }
  const tripRows = await dbFindTripsInRange(period.startDate, period.endDate)
  const trips = tripRows
    .filter((t) => t.periodId === id)
    .map(toTripDTO)
  return { ...toPeriodDTO(period), trips }
}

export async function closePeriod(dto: ClosePeriodDTO): Promise<ReimbursementPeriodDTO> {
  // 1. Busca trips no range para calcular totais
  const tripRows = await dbFindTripsInRange(dto.startDate, dto.endDate)
  const totalKmMeters = tripRows.reduce((acc, t) => acc + t.distanceMeters, 0)
  const totalCostCents = tripRows.reduce((acc, t) => acc + t.costCents, 0)

  const now = new Date().toISOString()

  // 2. Cria o período com os totais calculados
  const period = await dbCreatePeriod({
    label: dto.label,
    startDate: dto.startDate,
    endDate: dto.endDate,
    totalKmMeters,
    totalCostCents,
    closedAt: now,
    createdAt: now,
  })

  // 3. Atualiza os trips com o period_id
  await dbAssignTripsToPeriod(period.id, dto.startDate, dto.endDate)

  // 4. Retorna o período criado
  return toPeriodDTO(period)
}

// --- REPORT ---

export async function getReport(
  startDate: string,
  endDate: string,
): Promise<CarUsageReportDTO> {
  const tripRows = await dbFindTripsInRange(startDate, endDate)
  const trips = tripRows.map(toTripDTO)

  // Agrupa por dia
  const dayMap = new Map<string, CarTripDTO[]>()
  for (const trip of trips) {
    const existing = dayMap.get(trip.date)
    if (existing) {
      existing.push(trip)
    } else {
      dayMap.set(trip.date, [trip])
    }
  }

  const days: CarUsageDayBreakdownDTO[] = Array.from(dayMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, dayTrips]) => ({
      date,
      trips: dayTrips,
      totalKmMeters: dayTrips.reduce((acc, t) => acc + t.distanceMeters, 0),
      totalCostCents: dayTrips.reduce((acc, t) => acc + t.costCents, 0),
    }))

  return {
    startDate,
    endDate,
    totalKmMeters: trips.reduce((acc, t) => acc + t.distanceMeters, 0),
    totalCostCents: trips.reduce((acc, t) => acc + t.costCents, 0),
    days,
  }
}
