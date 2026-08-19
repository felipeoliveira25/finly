import type { StockPosition } from './stockPosition/model'
import type { TreasuryApplication } from './treasuryApplication/model'
import type { OptionPosition } from './optionPosition/model'
import type { PortfolioSnapshot } from './portfolioSnapshot/model'
import type { PortfolioDTO, CronRunDTO } from '@finly/shared-types'

export interface IInvestmentsRepository {
  getPortfolio(): Promise<PortfolioDTO>
  getSnapshots(limit?: number): Promise<PortfolioSnapshot[]>
  getStocks(): Promise<StockPosition[]>
  getTreasury(): Promise<TreasuryApplication[]>
  getOptions(): Promise<OptionPosition[]>
  getCronStatus(): Promise<CronRunDTO | null>
  triggerSnapshot(): Promise<void>
}
