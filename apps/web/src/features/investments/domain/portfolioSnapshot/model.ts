export interface PortfolioSnapshot {
  id: number
  snapshotDate: string
  stocksValueCents: number
  treasuryValueCents: number
  totalValueCents: number
  dataSource: string
  createdAt: string
}
