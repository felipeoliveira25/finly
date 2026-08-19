import { create } from 'zustand'
import { makeInvestmentsHttpRepository } from '../../../infra/services/api/investmentsHttpRepository'
import {
  makeGetPortfolioService,
  makeGetSnapshotsService,
  makeGetStocksService,
  makeGetTreasuryService,
  makeGetOptionsService,
  makeTriggerSnapshotService,
} from '../../../application/portfolioServiceFactory'
import type { StockPosition } from '../../../domain/stockPosition/model'
import type { TreasuryApplication } from '../../../domain/treasuryApplication/model'
import type { OptionPosition } from '../../../domain/optionPosition/model'
import type { PortfolioSnapshot } from '../../../domain/portfolioSnapshot/model'
import type { PortfolioDTO } from '@finly/shared-types'

interface InvestmentsState {
  portfolio: PortfolioDTO | null
  snapshots: PortfolioSnapshot[]
  stocks: StockPosition[]
  treasury: TreasuryApplication[]
  options: OptionPosition[]
  isLoading: boolean
  error: string | null
  fetchAll(): Promise<void>
  triggerSnapshot(): Promise<void>
}

export const useInvestmentsStore = create<InvestmentsState>((set) => ({
  portfolio: null,
  snapshots: [],
  stocks: [],
  treasury: [],
  options: [],
  isLoading: false,
  error: null,

  fetchAll: async () => {
    set({ isLoading: true, error: null })
    try {
      const repo = makeInvestmentsHttpRepository()
      const [portfolio, snapshots, stocks, treasury, options] = await Promise.all([
        makeGetPortfolioService(repo).execute(),
        makeGetSnapshotsService(repo).execute(90),
        makeGetStocksService(repo).execute(),
        makeGetTreasuryService(repo).execute(),
        makeGetOptionsService(repo).execute(),
      ])
      set({ portfolio, snapshots, stocks, treasury, options })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar investimentos' })
    } finally {
      set({ isLoading: false })
    }
  },

  triggerSnapshot: async () => {
    set({ error: null })
    try {
      const repo = makeInvestmentsHttpRepository()
      await makeTriggerSnapshotService(repo).execute()
      // Reload portfolio after triggering
      const portfolio = await makeGetPortfolioService(repo).execute()
      const snapshots = await makeGetSnapshotsService(repo).execute(90)
      set({ portfolio, snapshots })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao disparar snapshot' })
    }
  },
}))
