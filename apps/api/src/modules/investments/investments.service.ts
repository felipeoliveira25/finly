import type {
  StockPositionDTO,
  TreasuryApplicationDTO,
  OptionPositionDTO,
  PortfolioSnapshotDTO,
  PortfolioDTO,
  RentabilityWindowDTO,
  CronRunDTO,
} from '@finly/shared-types'
import {
  dbFindAllStockPositions,
  dbFindAllTreasuryApplications,
  dbFindAllRedemptions,
  dbFindRedemptionsByApplicationId,
  dbFindActiveOptionPositions,
  dbFindLatestSnapshot,
  dbFindSnapshotBeforeDate,
  dbFindLastNSnapshots,
  dbFindLastCronRun,
  dbFindPurchasesInRange,
  dbFindRedemptionsInRange,
} from './investments.repository'

// --- Helpers ---

function estimateTreasuryValue(
  investmentAmountCents: number,
  contractedRateBps: number,
  purchaseDate: string,
  referenceDate: Date = new Date(),
): number {
  const rate = contractedRateBps / 10000 // bps to decimal (e.g. 1425 -> 0.1425)
  const purchaseDateObj = new Date(purchaseDate + 'T00:00:00Z')
  const msPerDay = 1000 * 60 * 60 * 24
  const daysSincePurchase = Math.floor(
    (referenceDate.getTime() - purchaseDateObj.getTime()) / msPerDay,
  )
  if (daysSincePurchase <= 0) return investmentAmountCents
  return Math.round(investmentAmountCents * Math.pow(1 + rate, daysSincePurchase / 365))
}

function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + 'T00:00:00Z')
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / msPerDay))
}

function subtractDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() - days)
  return d
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function calcRentabilityWindow(
  latest: PortfolioSnapshotDTO,
  initial: PortfolioSnapshotDTO | null,
  aportesCents: number,
  resgatesCents: number,
  getLatestValue: (s: PortfolioSnapshotDTO) => number,
  getInitialValue: (s: PortfolioSnapshotDTO) => number,
): number | null {
  if (!initial) return null
  const vFinal = getLatestValue(latest)
  const vInicial = getInitialValue(initial)
  if (vInicial === 0) return null
  return Math.round(((vFinal - vInicial - aportesCents + resgatesCents) / vInicial) * 10000)
}

// --- Mappers ---

type StockPositionRow = { id: number; ticker: string; quantity: number; avgPriceCents: number; createdAt: string; updatedAt: string }
type TreasuryApplicationRow = { id: number; titleCode: string; maturityDate: string; investmentAmountCents: number; contractedRateBps: number; purchaseDate: string; createdAt: string }
type OptionPositionRow = { id: number; underlyingAsset: string; optionType: string; strategyLabel: string | null; quantity: number; premiumReceivedCents: number; strikeCents: number; breakevenCents: number; popBps: number; expiryDate: string; isActive: number; createdAt: string; closedAt: string | null }
type SnapshotRow = { id: number; snapshotDate: string; stocksValueCents: number; treasuryValueCents: number; totalValueCents: number; dataSource: string; createdAt: string }
type CronRunRow = { id: number; jobName: string; ranAt: string; status: string; errorMsg: string | null; createdAt: string }

function toStockDTO(row: StockPositionRow): StockPositionDTO {
  return {
    id: row.id,
    ticker: row.ticker,
    quantity: row.quantity,
    avgPriceCents: row.avgPriceCents,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toSnapshotDTO(row: SnapshotRow): PortfolioSnapshotDTO {
  return {
    id: row.id,
    snapshotDate: row.snapshotDate,
    stocksValueCents: row.stocksValueCents,
    treasuryValueCents: row.treasuryValueCents,
    totalValueCents: row.totalValueCents,
    dataSource: row.dataSource,
    createdAt: row.createdAt,
  }
}

function toCronRunDTO(row: CronRunRow): CronRunDTO {
  return {
    id: row.id,
    jobName: row.jobName,
    ranAt: row.ranAt,
    status: row.status,
    errorMsg: row.errorMsg,
    createdAt: row.createdAt,
  }
}

// --- Service functions ---

export async function listStocks(): Promise<StockPositionDTO[]> {
  const rows = await dbFindAllStockPositions()
  return rows.map(toStockDTO)
}

export async function listTreasury(): Promise<TreasuryApplicationDTO[]> {
  const [applications, allRedemptions] = await Promise.all([
    dbFindAllTreasuryApplications(),
    dbFindAllRedemptions(),
  ])

  const now = new Date()

  return applications.map((app) => {
    const redemptions = allRedemptions.filter((r) => r.applicationId === app.id)
    const totalRedeemedCents = redemptions.reduce((acc, r) => acc + r.redeemedAmountCents, 0)
    const estimatedValueCents = estimateTreasuryValue(
      app.investmentAmountCents,
      app.contractedRateBps,
      app.purchaseDate,
      now,
    )
    return {
      id: app.id,
      titleCode: app.titleCode,
      maturityDate: app.maturityDate,
      investmentAmountCents: app.investmentAmountCents,
      contractedRateBps: app.contractedRateBps,
      purchaseDate: app.purchaseDate,
      estimatedValueCents,
      totalRedeemedCents,
      createdAt: app.createdAt,
    }
  })
}

export async function listOptions(): Promise<OptionPositionDTO[]> {
  const rows = await dbFindActiveOptionPositions()
  return rows.map((row: OptionPositionRow) => ({
    id: row.id,
    underlyingAsset: row.underlyingAsset,
    optionType: row.optionType,
    strategyLabel: row.strategyLabel,
    quantity: row.quantity,
    premiumReceivedCents: row.premiumReceivedCents,
    strikeCents: row.strikeCents,
    breakevenCents: row.breakevenCents,
    popBps: row.popBps,
    expiryDate: row.expiryDate,
    daysToExpiry: daysUntil(row.expiryDate),
    isActive: row.isActive === 1,
    createdAt: row.createdAt,
  }))
}

export async function listSnapshots(limit: number): Promise<PortfolioSnapshotDTO[]> {
  const rows = await dbFindLastNSnapshots(limit)
  return rows.map(toSnapshotDTO)
}

export async function getCronStatus(): Promise<CronRunDTO | null> {
  const row = await dbFindLastCronRun('portfolio-snapshot')
  return row ? toCronRunDTO(row) : null
}

async function buildRentabilityWindow(
  latest: PortfolioSnapshotDTO,
  windowDays: number,
  getLatestValue: (s: PortfolioSnapshotDTO) => number,
  getInitialValue: (s: PortfolioSnapshotDTO) => number,
  aportesFn: (start: string, end: string) => Promise<number>,
  resgatesFn: (start: string, end: string) => Promise<number>,
): Promise<number | null> {
  const latestDate = new Date(latest.snapshotDate + 'T00:00:00Z')
  const windowStart = subtractDays(latestDate, windowDays)
  const windowStartStr = toDateString(windowStart)

  const initialRow = await dbFindSnapshotBeforeDate(windowStartStr)
  if (!initialRow) return null
  const initial = toSnapshotDTO(initialRow)

  const [aportes, resgates] = await Promise.all([
    aportesFn(windowStartStr, latest.snapshotDate),
    resgatesFn(windowStartStr, latest.snapshotDate),
  ])

  return calcRentabilityWindow(latest, initial, aportes, resgates, getLatestValue, getInitialValue)
}

export async function getPortfolio(): Promise<PortfolioDTO> {
  const [latestRow, lastCronRow] = await Promise.all([
    dbFindLatestSnapshot(),
    dbFindLastCronRun('portfolio-snapshot'),
  ])

  const latestSnapshot = latestRow ? toSnapshotDTO(latestRow) : null
  const lastCronRun = lastCronRow ? toCronRunDTO(lastCronRow) : null

  const emptyWindow: RentabilityWindowDTO = { week: null, month: null, semester: null, year: null }

  if (!latestSnapshot) {
    return {
      latestSnapshot: null,
      rentability: { stocks: emptyWindow, treasury: emptyWindow, total: emptyWindow },
      lastCronRun,
    }
  }

  // Aportes em ações = compras no período (totalCostCents)
  async function stockAportes(start: string, end: string): Promise<number> {
    const purchases = await dbFindPurchasesInRange(start, end)
    return purchases.reduce((acc, p) => acc + p.totalCostCents, 0)
  }

  // Resgates do tesouro no período
  async function treasuryResgates(start: string, end: string): Promise<number> {
    const redemptions = await dbFindRedemptionsInRange(start, end)
    return redemptions.reduce((acc, r) => acc + r.redeemedAmountCents, 0)
  }

  const windows = [7, 30, 180, 365]
  const windowKeys: (keyof RentabilityWindowDTO)[] = ['week', 'month', 'semester', 'year']

  const stocksWindow: RentabilityWindowDTO = { week: null, month: null, semester: null, year: null }
  const treasuryWindow: RentabilityWindowDTO = { week: null, month: null, semester: null, year: null }
  const totalWindow: RentabilityWindowDTO = { week: null, month: null, semester: null, year: null }

  await Promise.all(
    windows.map(async (days, i) => {
      const key = windowKeys[i]
      const [stocksVal, treasuryVal, totalVal] = await Promise.all([
        buildRentabilityWindow(
          latestSnapshot,
          days,
          (s) => s.stocksValueCents,
          (s) => s.stocksValueCents,
          stockAportes,
          async () => 0,
        ),
        buildRentabilityWindow(
          latestSnapshot,
          days,
          (s) => s.treasuryValueCents,
          (s) => s.treasuryValueCents,
          async () => 0,
          treasuryResgates,
        ),
        buildRentabilityWindow(
          latestSnapshot,
          days,
          (s) => s.totalValueCents,
          (s) => s.totalValueCents,
          stockAportes,
          treasuryResgates,
        ),
      ])
      stocksWindow[key] = stocksVal
      treasuryWindow[key] = treasuryVal
      totalWindow[key] = totalVal
    }),
  )

  return {
    latestSnapshot,
    rentability: { stocks: stocksWindow, treasury: treasuryWindow, total: totalWindow },
    lastCronRun,
  }
}

export async function calculateCurrentPortfolioValues(): Promise<{
  stocksValueCents: number
  treasuryValueCents: number
  totalValueCents: number
}> {
  const [stocks, applications, allRedemptions] = await Promise.all([
    dbFindAllStockPositions(),
    dbFindAllTreasuryApplications(),
    dbFindAllRedemptions(),
  ])

  // We need market prices for stocks — this is used for manual/seed snapshots without brapi
  // For the cron job, prices come from brapi. Here we use avgPriceCents as fallback.
  const stocksValueCents = stocks.reduce((acc, s) => acc + s.quantity * s.avgPriceCents, 0)

  const now = new Date()
  const treasuryValueCents = applications.reduce((acc, app) => {
    const redemptions = allRedemptions.filter((r) => r.applicationId === app.id)
    const totalRedeemed = redemptions.reduce((sum, r) => sum + r.redeemedAmountCents, 0)
    const estimated = estimateTreasuryValue(
      app.investmentAmountCents,
      app.contractedRateBps,
      app.purchaseDate,
      now,
    )
    return acc + Math.max(0, estimated - totalRedeemed)
  }, 0)

  return {
    stocksValueCents,
    treasuryValueCents,
    totalValueCents: stocksValueCents + treasuryValueCents,
  }
}

export { estimateTreasuryValue }
