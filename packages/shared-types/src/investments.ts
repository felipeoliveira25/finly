export interface StockPositionDTO {
  id: number
  ticker: string
  quantity: number
  avgPriceCents: number
  createdAt: string
  updatedAt: string
}

export interface TreasuryApplicationDTO {
  id: number
  titleCode: string
  maturityDate: string
  investmentAmountCents: number
  contractedRateBps: number
  purchaseDate: string
  estimatedValueCents: number
  totalRedeemedCents: number
  createdAt: string
}

export interface OptionPositionDTO {
  id: number
  underlyingAsset: string
  optionType: string
  strategyLabel: string | null
  quantity: number
  premiumReceivedCents: number
  strikeCents: number
  breakevenCents: number
  popBps: number
  expiryDate: string
  daysToExpiry: number
  isActive: boolean
  createdAt: string
}

export interface PortfolioSnapshotDTO {
  id: number
  snapshotDate: string
  stocksValueCents: number
  treasuryValueCents: number
  totalValueCents: number
  dataSource: string
  createdAt: string
}

export interface RentabilityWindowDTO {
  week: number | null
  month: number | null
  semester: number | null
  year: number | null
}

export interface CronRunDTO {
  id: number
  jobName: string
  ranAt: string
  status: string
  errorMsg: string | null
  createdAt: string
}

export interface PortfolioDTO {
  latestSnapshot: PortfolioSnapshotDTO | null
  rentability: {
    stocks: RentabilityWindowDTO
    treasury: RentabilityWindowDTO
    total: RentabilityWindowDTO
  }
  lastCronRun: CronRunDTO | null
}
