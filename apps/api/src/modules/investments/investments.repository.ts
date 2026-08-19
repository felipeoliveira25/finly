import { eq, desc, asc } from 'drizzle-orm'
import { db } from '../../db/client'
import {
  stockPositions,
  stockPurchases,
  treasuryApplications,
  treasuryRedemptions,
  optionPositions,
  portfolioSnapshots,
  cronRuns,
} from '../../db/schema'

type StockPositionRow = typeof stockPositions.$inferSelect
type StockPurchaseRow = typeof stockPurchases.$inferSelect
type TreasuryApplicationRow = typeof treasuryApplications.$inferSelect
type TreasuryRedemptionRow = typeof treasuryRedemptions.$inferSelect
type OptionPositionRow = typeof optionPositions.$inferSelect
type PortfolioSnapshotRow = typeof portfolioSnapshots.$inferSelect
type CronRunRow = typeof cronRuns.$inferSelect

// STOCK POSITIONS

export async function dbFindAllStockPositions(): Promise<StockPositionRow[]> {
  return db.select().from(stockPositions).orderBy(asc(stockPositions.ticker))
}

export async function dbFindStockPositionByTicker(ticker: string): Promise<StockPositionRow | null> {
  const rows = await db.select().from(stockPositions).where(eq(stockPositions.ticker, ticker))
  return rows[0] ?? null
}

export async function dbCountStockPositions(): Promise<number> {
  const rows = await db.select().from(stockPositions)
  return rows.length
}

export async function dbInsertStockPosition(data: {
  ticker: string
  quantity: number
  avgPriceCents: number
  createdAt: string
  updatedAt: string
}): Promise<StockPositionRow> {
  const [row] = await db.insert(stockPositions).values(data).returning()
  return row
}

// STOCK PURCHASES

export async function dbFindPurchasesByTicker(ticker: string): Promise<StockPurchaseRow[]> {
  return db
    .select()
    .from(stockPurchases)
    .where(eq(stockPurchases.ticker, ticker))
    .orderBy(asc(stockPurchases.purchaseDate))
}

export async function dbFindPurchasesInRange(
  startDate: string,
  endDate: string,
): Promise<StockPurchaseRow[]> {
  const rows = await db.select().from(stockPurchases).orderBy(asc(stockPurchases.purchaseDate))
  return rows.filter((r) => r.purchaseDate >= startDate && r.purchaseDate <= endDate)
}

export async function dbInsertStockPurchase(data: {
  ticker: string
  quantity: number
  unitPriceCents: number
  totalCostCents: number
  purchaseDate: string
  createdAt: string
}): Promise<StockPurchaseRow> {
  const [row] = await db.insert(stockPurchases).values(data).returning()
  return row
}

// TREASURY APPLICATIONS

export async function dbFindAllTreasuryApplications(): Promise<TreasuryApplicationRow[]> {
  return db
    .select()
    .from(treasuryApplications)
    .orderBy(asc(treasuryApplications.purchaseDate))
}

export async function dbCountTreasuryApplications(): Promise<number> {
  const rows = await db.select().from(treasuryApplications)
  return rows.length
}

export async function dbInsertTreasuryApplication(data: {
  titleCode: string
  maturityDate: string
  investmentAmountCents: number
  contractedRateBps: number
  purchaseDate: string
  createdAt: string
}): Promise<TreasuryApplicationRow> {
  const [row] = await db.insert(treasuryApplications).values(data).returning()
  return row
}

// TREASURY REDEMPTIONS

export async function dbFindRedemptionsByApplicationId(
  applicationId: number,
): Promise<TreasuryRedemptionRow[]> {
  return db
    .select()
    .from(treasuryRedemptions)
    .where(eq(treasuryRedemptions.applicationId, applicationId))
    .orderBy(asc(treasuryRedemptions.redemptionDate))
}

export async function dbFindAllRedemptions(): Promise<TreasuryRedemptionRow[]> {
  return db.select().from(treasuryRedemptions).orderBy(asc(treasuryRedemptions.redemptionDate))
}

export async function dbFindRedemptionsInRange(
  startDate: string,
  endDate: string,
): Promise<TreasuryRedemptionRow[]> {
  const rows = await db.select().from(treasuryRedemptions)
  return rows.filter((r) => r.redemptionDate >= startDate && r.redemptionDate <= endDate)
}

export async function dbCountRedemptions(): Promise<number> {
  const rows = await db.select().from(treasuryRedemptions)
  return rows.length
}

export async function dbInsertTreasuryRedemption(data: {
  applicationId: number
  redeemedAmountCents: number
  redemptionDate: string
  createdAt: string
}): Promise<TreasuryRedemptionRow> {
  const [row] = await db.insert(treasuryRedemptions).values(data).returning()
  return row
}

// OPTION POSITIONS

export async function dbFindActiveOptionPositions(): Promise<OptionPositionRow[]> {
  return db
    .select()
    .from(optionPositions)
    .where(eq(optionPositions.isActive, 1))
    .orderBy(asc(optionPositions.expiryDate))
}

export async function dbCountOptionPositions(): Promise<number> {
  const rows = await db.select().from(optionPositions)
  return rows.length
}

export async function dbInsertOptionPosition(data: {
  underlyingAsset: string
  optionType: string
  strategyLabel: string | null
  quantity: number
  premiumReceivedCents: number
  strikeCents: number
  breakevenCents: number
  popBps: number
  expiryDate: string
  isActive: number
  createdAt: string
  closedAt: string | null
}): Promise<OptionPositionRow> {
  const [row] = await db.insert(optionPositions).values(data).returning()
  return row
}

// PORTFOLIO SNAPSHOTS

export async function dbFindLatestSnapshot(): Promise<PortfolioSnapshotRow | null> {
  const rows = await db
    .select()
    .from(portfolioSnapshots)
    .orderBy(desc(portfolioSnapshots.snapshotDate))
    .limit(1)
  return rows[0] ?? null
}

export async function dbFindSnapshotByDate(date: string): Promise<PortfolioSnapshotRow | null> {
  const rows = await db
    .select()
    .from(portfolioSnapshots)
    .where(eq(portfolioSnapshots.snapshotDate, date))
  return rows[0] ?? null
}

export async function dbFindSnapshotBeforeDate(date: string): Promise<PortfolioSnapshotRow | null> {
  const rows = await db
    .select()
    .from(portfolioSnapshots)
    .orderBy(desc(portfolioSnapshots.snapshotDate))
  const filtered = rows.filter((r) => r.snapshotDate <= date)
  return filtered[0] ?? null
}

export async function dbFindLastNSnapshots(limit: number): Promise<PortfolioSnapshotRow[]> {
  const rows = await db
    .select()
    .from(portfolioSnapshots)
    .orderBy(desc(portfolioSnapshots.snapshotDate))
    .limit(limit)
  return rows.reverse()
}

export async function dbCountSnapshots(): Promise<number> {
  const rows = await db.select().from(portfolioSnapshots)
  return rows.length
}

export async function dbInsertSnapshot(data: {
  snapshotDate: string
  stocksValueCents: number
  treasuryValueCents: number
  totalValueCents: number
  dataSource: string
  createdAt: string
}): Promise<PortfolioSnapshotRow> {
  const [row] = await db.insert(portfolioSnapshots).values(data).returning()
  return row
}

export async function dbUpsertSnapshot(data: {
  snapshotDate: string
  stocksValueCents: number
  treasuryValueCents: number
  totalValueCents: number
  dataSource: string
  createdAt: string
}): Promise<PortfolioSnapshotRow> {
  const existing = await dbFindSnapshotByDate(data.snapshotDate)
  if (existing) {
    const [row] = await db
      .update(portfolioSnapshots)
      .set({
        stocksValueCents: data.stocksValueCents,
        treasuryValueCents: data.treasuryValueCents,
        totalValueCents: data.totalValueCents,
        dataSource: data.dataSource,
      })
      .where(eq(portfolioSnapshots.snapshotDate, data.snapshotDate))
      .returning()
    return row
  }
  return dbInsertSnapshot(data)
}

// CRON RUNS

export async function dbFindLastCronRun(jobName: string): Promise<CronRunRow | null> {
  const rows = await db
    .select()
    .from(cronRuns)
    .where(eq(cronRuns.jobName, jobName))
    .orderBy(desc(cronRuns.ranAt))
    .limit(1)
  return rows[0] ?? null
}

export async function dbInsertCronRun(data: {
  jobName: string
  ranAt: string
  status: string
  errorMsg: string | null
  createdAt: string
}): Promise<CronRunRow> {
  const [row] = await db.insert(cronRuns).values(data).returning()
  return row
}
