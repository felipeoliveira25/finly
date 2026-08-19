import {
  dbCountStockPositions,
  dbInsertStockPosition,
  dbInsertStockPurchase,
  dbInsertTreasuryApplication,
  dbInsertTreasuryRedemption,
  dbInsertOptionPosition,
  dbCountTreasuryApplications,
  dbCountOptionPositions,
  dbCountSnapshots,
  dbInsertSnapshot,
} from '../../modules/investments/investments.repository'
import { estimateTreasuryValue } from '../../modules/investments/investments.service'

const STOCKS: Array<{
  ticker: string
  qty: number
  avgPriceCents: number
  snapshotUnitPriceCents: number
}> = [
  { ticker: 'WEGE3', qty: 36, avgPriceCents: 4369, snapshotUnitPriceCents: 4500 },
  { ticker: 'B3SA3', qty: 100, avgPriceCents: 1578, snapshotUnitPriceCents: 1480 },
  { ticker: 'BBSE3', qty: 33, avgPriceCents: 3216, snapshotUnitPriceCents: 4258 },
  { ticker: 'ITSA4', qty: 100, avgPriceCents: 1282, snapshotUnitPriceCents: 1372 },
  { ticker: 'FLRY3', qty: 71, avgPriceCents: 1555, snapshotUnitPriceCents: 1823 },
  { ticker: 'EMBJ3', qty: 15, avgPriceCents: 7223, snapshotUnitPriceCents: 8380 },
  { ticker: 'PRIO3', qty: 18, avgPriceCents: 6490, snapshotUnitPriceCents: 5991 },
  { ticker: 'RANI3', qty: 100, avgPriceCents: 796, snapshotUnitPriceCents: 795 },
  { ticker: 'BRKM5', qty: 100, avgPriceCents: 1193, snapshotUnitPriceCents: 663 },
]

const TREASURY_APPLICATIONS: Array<{
  titleCode: string
  maturityDate: string
  purchaseDate: string
  investmentAmountCents: number
  contractedRateBps: number
}> = [
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-06-15', investmentAmountCents: 29734, contractedRateBps: 1425 },
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-06-25', investmentAmountCents: 27760, contractedRateBps: 1438 },
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-07-03', investmentAmountCents: 469052, contractedRateBps: 1449 },
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-07-08', investmentAmountCents: 12868, contractedRateBps: 1457 },
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-07-21', investmentAmountCents: 26278, contractedRateBps: 1462 },
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-07-22', investmentAmountCents: 34225, contractedRateBps: 1474 },
  { titleCode: 'TD-2032', maturityDate: '2032-01-01', purchaseDate: '2026-07-30', investmentAmountCents: 67815, contractedRateBps: 1456 },
  { titleCode: 'TD-2029', maturityDate: '2029-01-01', purchaseDate: '2026-07-30', investmentAmountCents: 6553, contractedRateBps: 1415 },
]

export async function runInvestmentsSeed(): Promise<void> {
  const [stockCount, treasuryCount, optionCount, snapshotCount] = await Promise.all([
    dbCountStockPositions(),
    dbCountTreasuryApplications(),
    dbCountOptionPositions(),
    dbCountSnapshots(),
  ])

  if (stockCount > 0 || treasuryCount > 0 || optionCount > 0) {
    console.log('[seed] investments: dados já existem, seed ignorado.')
    return
  }

  console.log('[seed] investments: inserindo dados iniciais...')

  const now = new Date().toISOString()

  // Stock positions + purchases
  for (const s of STOCKS) {
    await dbInsertStockPosition({
      ticker: s.ticker,
      quantity: s.qty,
      avgPriceCents: s.avgPriceCents,
      createdAt: now,
      updatedAt: now,
    })
    await dbInsertStockPurchase({
      ticker: s.ticker,
      quantity: s.qty,
      unitPriceCents: s.avgPriceCents,
      totalCostCents: s.qty * s.avgPriceCents,
      purchaseDate: '2026-07-01',
      createdAt: now,
    })
  }

  // Treasury applications
  const insertedApplications: Array<{ id: number; titleCode: string }> = []
  for (const app of TREASURY_APPLICATIONS) {
    const row = await dbInsertTreasuryApplication({
      titleCode: app.titleCode,
      maturityDate: app.maturityDate,
      investmentAmountCents: app.investmentAmountCents,
      contractedRateBps: app.contractedRateBps,
      purchaseDate: app.purchaseDate,
      createdAt: now,
    })
    insertedApplications.push({ id: row.id, titleCode: app.titleCode })
  }

  // Treasury redemption: last TD-2029
  const td2029 = insertedApplications.find((a) => a.titleCode === 'TD-2029')
  if (td2029) {
    await dbInsertTreasuryRedemption({
      applicationId: td2029.id,
      redeemedAmountCents: 48000,
      redemptionDate: '2026-08-01',
      createdAt: now,
    })
  }

  // Option position
  await dbInsertOptionPosition({
    underlyingAsset: 'BOVA11',
    optionType: 'call',
    strategyLabel: 'call descoberta com trava de baixa',
    quantity: 300,
    premiumReceivedCents: 44100,
    strikeCents: 0,
    breakevenCents: 18447,
    popBps: 9388,
    expiryDate: '2026-10-16',
    isActive: 1,
    createdAt: now,
    closedAt: null,
  })

  // Initial snapshot (today)
  if (snapshotCount === 0) {
    const snapshotDate = new Date().toISOString().slice(0, 10)

    const stocksValueCents = STOCKS.reduce(
      (acc, s) => acc + s.qty * s.snapshotUnitPriceCents,
      0,
    )

    const nowDate = new Date()
    const allRedemptions = [{ applicationId: td2029?.id ?? 0, redeemedAmountCents: 48000 }]

    const treasuryValueCents = TREASURY_APPLICATIONS.reduce((acc, app, idx) => {
      const appId = insertedApplications[idx]?.id ?? 0
      const estimated = estimateTreasuryValue(
        app.investmentAmountCents,
        app.contractedRateBps,
        app.purchaseDate,
        nowDate,
      )
      const totalRedeemed = allRedemptions
        .filter((r) => r.applicationId === appId)
        .reduce((sum, r) => sum + r.redeemedAmountCents, 0)
      return acc + Math.max(0, estimated - totalRedeemed)
    }, 0)

    await dbInsertSnapshot({
      snapshotDate,
      stocksValueCents,
      treasuryValueCents,
      totalValueCents: stocksValueCents + treasuryValueCents,
      dataSource: 'seed',
      createdAt: now,
    })
  }

  console.log('[seed] investments: seed concluído.')
}
