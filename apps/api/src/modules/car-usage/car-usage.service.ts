import type {
  CarUsageConfigDTO,
  CreateCarUsageConfigDTO,
  FixedRouteDTO,
  CreateFixedRouteDTO,
  UpdateFixedRouteDTO,
  CarTripDTO,
  CreateCarTripDTO,
  ParkingFeeDTO,
  CreateParkingFeeDTO,
  FuelRefillDTO,
  CreateFuelRefillDTO,
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
  dbFindParkingFees,
  dbFindParkingFeeById,
  dbCreateParkingFee,
  dbDeleteParkingFee,
  dbFindParkingFeesInRange,
  dbAssignParkingFeesToPeriod,
  dbFindFuelRefills,
  dbFindFuelRefillById,
  dbCreateFuelRefill,
  dbDeleteFuelRefill,
  dbFindFuelRefillsInRange,
  dbAssignFuelRefillsToPeriod,
} from './car-usage.repository'

// --- Mapper helpers ---

type ConfigRow = Awaited<ReturnType<typeof dbFindAllConfigs>>[number]
type FixedRouteRow = Awaited<ReturnType<typeof dbFindAllFixedRoutes>>[number]
type PeriodRow = Awaited<ReturnType<typeof dbFindAllPeriods>>[number]
type TripWithRoute = Awaited<ReturnType<typeof dbFindTrips>>[number]
type ParkingFeeRow = Awaited<ReturnType<typeof dbFindParkingFees>>[number]
type FuelRefillRow = Awaited<ReturnType<typeof dbFindFuelRefills>>[number]

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

function toParkingFeeDTO(row: ParkingFeeRow): ParkingFeeDTO {
  return {
    id: row.id,
    date: row.date,
    amountCents: row.amountCents,
    description: row.description ?? null,
    periodId: row.periodId ?? null,
    createdAt: row.createdAt,
  }
}

function toFuelRefillDTO(row: FuelRefillRow): FuelRefillDTO {
  return {
    id: row.id,
    date: row.date,
    amountCents: row.amountCents,
    description: row.description ?? null,
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
    totalParkingCents: row.totalParkingCents ?? 0,
    totalFuelRefillCents: row.totalFuelRefillCents ?? 0,
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
  const trip = await dbFindTripById(id)
  if (!trip) {
    throw new AppError('Registro não encontrado', 404)
  }
  if (trip.periodId !== null) {
    throw new AppError('Registro pertence a período fechado', 409)
  }
  await dbDeleteTrip(id)
}

// --- PARKING FEES ---

export async function listParkingFees(filters: {
  startDate?: string
  endDate?: string
}): Promise<ParkingFeeDTO[]> {
  const rows = await dbFindParkingFees(filters)
  return rows.map(toParkingFeeDTO)
}

export async function addParkingFee(dto: CreateParkingFeeDTO): Promise<ParkingFeeDTO> {
  if (dto.amountCents <= 0) {
    throw new AppError('amountCents deve ser maior que zero', 400)
  }
  if (!dto.date || !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
    throw new AppError('date deve ser uma data válida no formato YYYY-MM-DD', 400)
  }

  const period = await dbFindPeriodContainingDate(dto.date)
  if (period) {
    throw new AppError('Data pertence a período fechado', 409)
  }

  const row = await dbCreateParkingFee({
    date: dto.date,
    amountCents: dto.amountCents,
    description: dto.description ?? null,
    createdAt: new Date().toISOString(),
  })
  return toParkingFeeDTO(row)
}

export async function deleteParkingFee(id: number): Promise<void> {
  const row = await dbFindParkingFeeById(id)
  if (!row) {
    throw new AppError('Estacionamento não encontrado', 404)
  }
  if (row.periodId !== null) {
    throw new AppError('Registro pertence a período fechado', 409)
  }
  await dbDeleteParkingFee(id)
}

// --- FUEL REFILLS ---

export async function listFuelRefills(filters: {
  startDate?: string
  endDate?: string
}): Promise<FuelRefillDTO[]> {
  const rows = await dbFindFuelRefills(filters)
  return rows.map(toFuelRefillDTO)
}

export async function addFuelRefill(dto: CreateFuelRefillDTO): Promise<FuelRefillDTO> {
  if (dto.amountCents <= 0) {
    throw new AppError('amountCents deve ser maior que zero', 400)
  }
  if (!dto.date || !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
    throw new AppError('date deve ser uma data válida no formato YYYY-MM-DD', 400)
  }

  const period = await dbFindPeriodContainingDate(dto.date)
  if (period) {
    throw new AppError('Data pertence a período fechado', 409)
  }

  const row = await dbCreateFuelRefill({
    date: dto.date,
    amountCents: dto.amountCents,
    description: dto.description ?? null,
    createdAt: new Date().toISOString(),
  })
  return toFuelRefillDTO(row)
}

export async function deleteFuelRefill(id: number): Promise<void> {
  const row = await dbFindFuelRefillById(id)
  if (!row) {
    throw new AppError('Abastecimento não encontrado', 404)
  }
  if (row.periodId !== null) {
    throw new AppError('Registro pertence a período fechado', 409)
  }
  await dbDeleteFuelRefill(id)
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
  // 1. Busca todos os dados do período para calcular totais
  const [tripRows, parkingRows, fuelRows] = await Promise.all([
    dbFindTripsInRange(dto.startDate, dto.endDate),
    dbFindParkingFeesInRange(dto.startDate, dto.endDate),
    dbFindFuelRefillsInRange(dto.startDate, dto.endDate),
  ])

  const totalKmMeters = tripRows.reduce((acc, t) => acc + t.distanceMeters, 0)
  const totalTripCostCents = tripRows.reduce((acc, t) => acc + t.costCents, 0)
  const totalParkingCents = parkingRows.reduce((acc, p) => acc + p.amountCents, 0)
  const totalFuelRefillCents = fuelRows.reduce((acc, f) => acc + f.amountCents, 0)
  // Total líquido: o usuário deve ao pai trajetos + estacionamentos, mas descontam os abastecimentos já pagos
  const totalCostCents = totalTripCostCents + totalParkingCents - totalFuelRefillCents

  const now = new Date().toISOString()

  // 2. Cria o período com os totais calculados
  const period = await dbCreatePeriod({
    label: dto.label,
    startDate: dto.startDate,
    endDate: dto.endDate,
    totalKmMeters,
    totalCostCents,
    totalParkingCents,
    totalFuelRefillCents,
    closedAt: now,
    createdAt: now,
  })

  // 3. Atualiza trips, estacionamentos e abastecimentos com o period_id
  await Promise.all([
    dbAssignTripsToPeriod(period.id, dto.startDate, dto.endDate),
    dbAssignParkingFeesToPeriod(period.id, dto.startDate, dto.endDate),
    dbAssignFuelRefillsToPeriod(period.id, dto.startDate, dto.endDate),
  ])

  return toPeriodDTO(period)
}

// --- REPORT ---

export async function getReport(
  startDate: string,
  endDate: string,
): Promise<CarUsageReportDTO> {
  const [tripRows, parkingRows, fuelRows] = await Promise.all([
    dbFindTripsInRange(startDate, endDate),
    dbFindParkingFeesInRange(startDate, endDate),
    dbFindFuelRefillsInRange(startDate, endDate),
  ])

  const trips = tripRows.map(toTripDTO)
  const parking = parkingRows.map(toParkingFeeDTO)
  const fuel = fuelRows.map(toFuelRefillDTO)

  // Coleta todas as datas únicas presentes em qualquer um dos três conjuntos
  const allDates = new Set<string>([
    ...trips.map((t) => t.date),
    ...parking.map((p) => p.date),
    ...fuel.map((f) => f.date),
  ])

  const days: CarUsageDayBreakdownDTO[] = Array.from(allDates)
    .sort()
    .map((date) => {
      const dayTrips = trips.filter((t) => t.date === date)
      const dayParking = parking.filter((p) => p.date === date)
      const dayFuel = fuel.filter((f) => f.date === date)

      const totalKmMeters = dayTrips.reduce((acc, t) => acc + t.distanceMeters, 0)
      const totalTripCost = dayTrips.reduce((acc, t) => acc + t.costCents, 0)
      const totalParkingCents = dayParking.reduce((acc, p) => acc + p.amountCents, 0)
      const totalFuelRefillCents = dayFuel.reduce((acc, f) => acc + f.amountCents, 0)

      return {
        date,
        trips: dayTrips,
        parkingFees: dayParking,
        fuelRefills: dayFuel,
        totalKmMeters,
        totalCostCents: totalTripCost + totalParkingCents - totalFuelRefillCents,
        totalParkingCents,
        totalFuelRefillCents,
      }
    })

  const totalKmMeters = trips.reduce((acc, t) => acc + t.distanceMeters, 0)
  const totalTripCost = trips.reduce((acc, t) => acc + t.costCents, 0)
  const totalParkingCents = parking.reduce((acc, p) => acc + p.amountCents, 0)
  const totalFuelRefillCents = fuel.reduce((acc, f) => acc + f.amountCents, 0)

  return {
    startDate,
    endDate,
    totalKmMeters,
    totalCostCents: totalTripCost + totalParkingCents - totalFuelRefillCents,
    totalParkingCents,
    totalFuelRefillCents,
    days,
  }
}
