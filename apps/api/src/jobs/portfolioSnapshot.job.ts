import {
  dbFindAllStockPositions,
  dbFindAllTreasuryApplications,
  dbFindAllRedemptions,
  dbUpsertSnapshot,
  dbInsertCronRun,
} from '../modules/investments/investments.repository'
import { estimateTreasuryValue } from '../modules/investments/investments.service'

interface BrapiQuoteResult {
  symbol: string
  regularMarketPrice: number
}

interface BrapiResponse {
  results: BrapiQuoteResult[]
}

const TICKERS = ['WEGE3', 'B3SA3', 'BBSE3', 'ITSA4', 'FLRY3', 'EMBJ3', 'PRIO3', 'RANI3', 'BRKM5']
const BRAPI_URL = `https://brapi.dev/api/quote/${TICKERS.join(',')}`

export async function runPortfolioSnapshotJob(): Promise<void> {
  const now = new Date()
  const ranAt = now.toISOString()
  const snapshotDate = ranAt.slice(0, 10)

  try {
    const response = await fetch(BRAPI_URL)
    if (!response.ok) {
      throw new Error(`brapi.dev retornou ${response.status}`)
    }
    const data = (await response.json()) as BrapiResponse

    const priceMap = new Map<string, number>()
    for (const result of data.results) {
      priceMap.set(result.symbol, result.regularMarketPrice)
    }

    const stocks = await dbFindAllStockPositions()
    const stocksValueCents = stocks.reduce((acc, s) => {
      const price = priceMap.get(s.ticker)
      if (price === undefined) return acc
      return acc + Math.round(s.quantity * price * 100)
    }, 0)

    const [applications, allRedemptions] = await Promise.all([
      dbFindAllTreasuryApplications(),
      dbFindAllRedemptions(),
    ])

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

    await dbUpsertSnapshot({
      snapshotDate,
      stocksValueCents,
      treasuryValueCents,
      totalValueCents: stocksValueCents + treasuryValueCents,
      dataSource: 'cron',
      createdAt: ranAt,
    })

    await dbInsertCronRun({
      jobName: 'portfolio-snapshot',
      ranAt,
      status: 'success',
      errorMsg: null,
      createdAt: ranAt,
    })

    console.log(`[cron] portfolio-snapshot OK — stocks: ${stocksValueCents} treasury: ${treasuryValueCents}`)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[cron] portfolio-snapshot ERRO: ${errorMsg}`)

    await dbInsertCronRun({
      jobName: 'portfolio-snapshot',
      ranAt,
      status: 'error',
      errorMsg,
      createdAt: ranAt,
    })
  }
}
