import { eq, lte, gte, and, isNull, desc, asc, getTableColumns } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  carUsageConfigs,
  fixedRoutes,
  carTrips,
  reimbursementPeriods,
  parkingFees,
  fuelRefills,
} from '../../db/schema'

type ConfigRow = typeof carUsageConfigs.$inferSelect
type FixedRouteRow = typeof fixedRoutes.$inferSelect
type PeriodRow = typeof reimbursementPeriods.$inferSelect
type TripRow = typeof carTrips.$inferSelect
type ParkingFeeRow = typeof parkingFees.$inferSelect
type FuelRefillRow = typeof fuelRefills.$inferSelect

// Para trips com nome do trajeto fixo (resultado de join)
type TripWithRoute = TripRow & { fixedRouteName: string | null }

// CONFIG

export async function dbFindAllConfigs(): Promise<ConfigRow[]> {
  return db.select().from(carUsageConfigs).orderBy(desc(carUsageConfigs.effectiveFrom))
}

export async function dbFindActiveConfig(date: string): Promise<ConfigRow | null> {
  const rows = await db
    .select()
    .from(carUsageConfigs)
    .where(lte(carUsageConfigs.effectiveFrom, date))
    .orderBy(desc(carUsageConfigs.effectiveFrom))
    .limit(1)
  return rows[0] ?? null
}

export async function dbCreateConfig(data: {
  pricePerLiterCents: number
  avgConsumptionCdkm: number
  effectiveFrom: string
  createdAt: string
}): Promise<ConfigRow> {
  const [row] = await db.insert(carUsageConfigs).values(data).returning()
  return row
}

// FIXED ROUTES

export async function dbFindAllFixedRoutes(onlyActive?: boolean): Promise<FixedRouteRow[]> {
  if (onlyActive) {
    return db
      .select()
      .from(fixedRoutes)
      .where(eq(fixedRoutes.isActive, true))
      .orderBy(asc(fixedRoutes.name))
  }
  return db.select().from(fixedRoutes).orderBy(asc(fixedRoutes.name))
}

export async function dbFindFixedRouteById(id: number): Promise<FixedRouteRow | null> {
  const rows = await db.select().from(fixedRoutes).where(eq(fixedRoutes.id, id))
  return rows[0] ?? null
}

export async function dbCreateFixedRoute(data: {
  name: string
  distanceMeters: number
  createdAt: string
  updatedAt: string
}): Promise<FixedRouteRow> {
  const [row] = await db.insert(fixedRoutes).values(data).returning()
  return row
}

export async function dbUpdateFixedRoute(
  id: number,
  data: { name?: string; distanceMeters?: number; updatedAt: string },
): Promise<FixedRouteRow | null> {
  const [row] = await db
    .update(fixedRoutes)
    .set(data)
    .where(eq(fixedRoutes.id, id))
    .returning()
  return row ?? null
}

export async function dbDeactivateFixedRoute(id: number, updatedAt: string): Promise<void> {
  await db
    .update(fixedRoutes)
    .set({ isActive: false, updatedAt })
    .where(eq(fixedRoutes.id, id))
}

// TRIPS

export async function dbFindTrips(filters: {
  startDate?: string
  endDate?: string
}): Promise<TripWithRoute[]> {
  const conditions = []
  if (filters.startDate) {
    conditions.push(gte(carTrips.date, filters.startDate))
  }
  if (filters.endDate) {
    conditions.push(lte(carTrips.date, filters.endDate))
  }

  const rows = await db
    .select({
      ...getTableColumns(carTrips),
      fixedRouteName: fixedRoutes.name,
    })
    .from(carTrips)
    .leftJoin(fixedRoutes, eq(carTrips.fixedRouteId, fixedRoutes.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(carTrips.date), asc(carTrips.createdAt))

  return rows.map((r) => ({ ...r, fixedRouteName: r.fixedRouteName ?? null }))
}

export async function dbFindTripById(id: number): Promise<TripWithRoute | null> {
  const rows = await db
    .select({
      ...getTableColumns(carTrips),
      fixedRouteName: fixedRoutes.name,
    })
    .from(carTrips)
    .leftJoin(fixedRoutes, eq(carTrips.fixedRouteId, fixedRoutes.id))
    .where(eq(carTrips.id, id))

  const row = rows[0]
  if (!row) return null
  return { ...row, fixedRouteName: row.fixedRouteName ?? null }
}

export async function dbCreateTrip(data: {
  date: string
  fixedRouteId: number | null
  distanceMeters: number
  description: string | null
  configId: number
  costCents: number
  createdAt: string
}): Promise<TripRow> {
  const [row] = await db.insert(carTrips).values(data).returning()
  return row
}

export async function dbDeleteTrip(id: number): Promise<void> {
  await db.delete(carTrips).where(eq(carTrips.id, id))
}

export async function dbFindPeriodContainingDate(date: string): Promise<PeriodRow | null> {
  const rows = await db
    .select()
    .from(reimbursementPeriods)
    .where(
      and(
        lte(reimbursementPeriods.startDate, date),
        gte(reimbursementPeriods.endDate, date),
      ),
    )
    .limit(1)
  return rows[0] ?? null
}

// PERIODS

export async function dbFindAllPeriods(): Promise<PeriodRow[]> {
  return db
    .select()
    .from(reimbursementPeriods)
    .orderBy(desc(reimbursementPeriods.startDate))
}

export async function dbFindPeriodById(id: number): Promise<PeriodRow | null> {
  const rows = await db
    .select()
    .from(reimbursementPeriods)
    .where(eq(reimbursementPeriods.id, id))
  return rows[0] ?? null
}

export async function dbCreatePeriod(data: {
  label: string
  startDate: string
  endDate: string
  totalKmMeters: number
  totalCostCents: number
  totalParkingCents: number
  totalFuelRefillCents: number
  closedAt: string
  createdAt: string
}): Promise<PeriodRow> {
  const [row] = await db.insert(reimbursementPeriods).values(data).returning()
  return row
}

export async function dbAssignTripsToPeriod(
  periodId: number,
  startDate: string,
  endDate: string,
): Promise<void> {
  await db
    .update(carTrips)
    .set({ periodId })
    .where(
      and(
        gte(carTrips.date, startDate),
        lte(carTrips.date, endDate),
        isNull(carTrips.periodId),
      ),
    )
}

export async function dbFindTripsInRange(
  startDate: string,
  endDate: string,
): Promise<TripWithRoute[]> {
  const rows = await db
    .select({
      ...getTableColumns(carTrips),
      fixedRouteName: fixedRoutes.name,
    })
    .from(carTrips)
    .leftJoin(fixedRoutes, eq(carTrips.fixedRouteId, fixedRoutes.id))
    .where(and(gte(carTrips.date, startDate), lte(carTrips.date, endDate)))
    .orderBy(asc(carTrips.date), asc(carTrips.createdAt))

  return rows.map((r) => ({ ...r, fixedRouteName: r.fixedRouteName ?? null }))
}

// PARKING FEES

export async function dbFindParkingFees(filters: {
  startDate?: string
  endDate?: string
}): Promise<ParkingFeeRow[]> {
  const conditions = []
  if (filters.startDate) conditions.push(gte(parkingFees.date, filters.startDate))
  if (filters.endDate) conditions.push(lte(parkingFees.date, filters.endDate))

  return db
    .select()
    .from(parkingFees)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(parkingFees.date), asc(parkingFees.createdAt))
}

export async function dbFindParkingFeeById(id: number): Promise<ParkingFeeRow | null> {
  const rows = await db.select().from(parkingFees).where(eq(parkingFees.id, id))
  return rows[0] ?? null
}

export async function dbCreateParkingFee(data: {
  date: string
  amountCents: number
  description: string | null
  createdAt: string
}): Promise<ParkingFeeRow> {
  const [row] = await db.insert(parkingFees).values(data).returning()
  return row
}

export async function dbDeleteParkingFee(id: number): Promise<void> {
  await db.delete(parkingFees).where(eq(parkingFees.id, id))
}

export async function dbFindParkingFeesInRange(
  startDate: string,
  endDate: string,
): Promise<ParkingFeeRow[]> {
  return db
    .select()
    .from(parkingFees)
    .where(and(gte(parkingFees.date, startDate), lte(parkingFees.date, endDate)))
    .orderBy(asc(parkingFees.date), asc(parkingFees.createdAt))
}

export async function dbAssignParkingFeesToPeriod(
  periodId: number,
  startDate: string,
  endDate: string,
): Promise<void> {
  await db
    .update(parkingFees)
    .set({ periodId })
    .where(
      and(
        gte(parkingFees.date, startDate),
        lte(parkingFees.date, endDate),
        isNull(parkingFees.periodId),
      ),
    )
}

// FUEL REFILLS

export async function dbFindFuelRefills(filters: {
  startDate?: string
  endDate?: string
}): Promise<FuelRefillRow[]> {
  const conditions = []
  if (filters.startDate) conditions.push(gte(fuelRefills.date, filters.startDate))
  if (filters.endDate) conditions.push(lte(fuelRefills.date, filters.endDate))

  return db
    .select()
    .from(fuelRefills)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(fuelRefills.date), asc(fuelRefills.createdAt))
}

export async function dbFindFuelRefillById(id: number): Promise<FuelRefillRow | null> {
  const rows = await db.select().from(fuelRefills).where(eq(fuelRefills.id, id))
  return rows[0] ?? null
}

export async function dbCreateFuelRefill(data: {
  date: string
  amountCents: number
  description: string | null
  createdAt: string
}): Promise<FuelRefillRow> {
  const [row] = await db.insert(fuelRefills).values(data).returning()
  return row
}

export async function dbDeleteFuelRefill(id: number): Promise<void> {
  await db.delete(fuelRefills).where(eq(fuelRefills.id, id))
}

export async function dbFindFuelRefillsInRange(
  startDate: string,
  endDate: string,
): Promise<FuelRefillRow[]> {
  return db
    .select()
    .from(fuelRefills)
    .where(and(gte(fuelRefills.date, startDate), lte(fuelRefills.date, endDate)))
    .orderBy(asc(fuelRefills.date), asc(fuelRefills.createdAt))
}

export async function dbAssignFuelRefillsToPeriod(
  periodId: number,
  startDate: string,
  endDate: string,
): Promise<void> {
  await db
    .update(fuelRefills)
    .set({ periodId })
    .where(
      and(
        gte(fuelRefills.date, startDate),
        lte(fuelRefills.date, endDate),
        isNull(fuelRefills.periodId),
      ),
    )
}
