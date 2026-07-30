import { create } from 'zustand'
import { makeMonthlySummaryHttpRepository } from '../../../infra/services/api/monthlySummary/monthlySummaryHttpRepository'
import { makeGetMonthlySummaryService } from '../../../application/monthlySummary/monthlySummaryServiceFactory'
import type { MonthlySummary } from '../../../domain/monthlySummary/model'

interface DashboardState {
  summary: MonthlySummary | null
  isLoading: boolean
  error: string | null
  fetchSummary: (monthKey: string) => Promise<void>
}

export const useFinanceDashboardStore = create<DashboardState>((set) => ({
  summary: null,
  isLoading: false,
  error: null,
  fetchSummary: async (monthKey) => {
    set({ isLoading: true, error: null })
    try {
      const repo = makeMonthlySummaryHttpRepository()
      const summary = await makeGetMonthlySummaryService(repo).execute(monthKey)
      set({ summary })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar resumo' })
    } finally {
      set({ isLoading: false })
    }
  },
}))
