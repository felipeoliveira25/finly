import { apiFetch } from '@/lib/api'
import type {
  StockPositionDTO,
  TreasuryApplicationDTO,
  OptionPositionDTO,
  PortfolioSnapshotDTO,
  PortfolioDTO,
  CronRunDTO,
} from '@finly/shared-types'
import { hydrateStockPosition } from '../../../domain/stockPosition/factory'
import { hydrateTreasuryApplication } from '../../../domain/treasuryApplication/factory'
import { hydrateOptionPosition } from '../../../domain/optionPosition/factory'
import { hydratePortfolioSnapshot } from '../../../domain/portfolioSnapshot/factory'
import type { IInvestmentsRepository } from '../../../domain/repository'

export function makeInvestmentsHttpRepository(): IInvestmentsRepository {
  return {
    getPortfolio: () => apiFetch<PortfolioDTO>('/investments/portfolio'),

    getSnapshots: async (limit = 90) => {
      const dtos = await apiFetch<PortfolioSnapshotDTO[]>(`/investments/snapshots?limit=${limit}`)
      return dtos.map(hydratePortfolioSnapshot)
    },

    getStocks: async () => {
      const dtos = await apiFetch<StockPositionDTO[]>('/investments/stocks')
      return dtos.map(hydrateStockPosition)
    },

    getTreasury: async () => {
      const dtos = await apiFetch<TreasuryApplicationDTO[]>('/investments/treasury')
      return dtos.map(hydrateTreasuryApplication)
    },

    getOptions: async () => {
      const dtos = await apiFetch<OptionPositionDTO[]>('/investments/options')
      return dtos.map(hydrateOptionPosition)
    },

    getCronStatus: () => apiFetch<CronRunDTO | null>('/investments/cron-status'),

    triggerSnapshot: async () => {
      await apiFetch<unknown>('/investments/trigger-snapshot', { method: 'POST' })
    },
  }
}
