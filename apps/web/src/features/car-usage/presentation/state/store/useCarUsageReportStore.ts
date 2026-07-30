import { create } from 'zustand'
import { makeCarUsageReportHttpRepository } from '../../../infra/services/api/carUsageReport/carUsageReportHttpRepository'
import { makeReimbursementPeriodHttpRepository } from '../../../infra/services/api/reimbursementPeriod/reimbursementPeriodHttpRepository'
import { makeGetReportService } from '../../../application/carUsageReport/carUsageReportServiceFactory'
import {
  makeListPeriodsService,
  makeClosePeriodService,
} from '../../../application/reimbursementPeriod/reimbursementPeriodServiceFactory'
import type { CarUsageReport } from '../../../domain/carUsageReport/model'
import type { ReimbursementPeriod } from '../../../domain/reimbursementPeriod/model'
import { todayISO } from '../../utils/format'

/** Returns first day of current month as 'YYYY-MM-DD' */
function firstDayOfMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

interface ReportState {
  report: CarUsageReport | null
  periods: ReimbursementPeriod[]
  startDate: string
  endDate: string
  isLoading: boolean
  error: string | null
  setDateRange: (startDate: string, endDate: string) => void
  fetchReport: () => Promise<void>
  fetchPeriods: () => Promise<void>
  closePeriod: (values: { label: string; startDate: string; endDate: string }) => Promise<void>
}

export const useCarUsageReportStore = create<ReportState>((set, get) => ({
  report: null,
  periods: [],
  startDate: firstDayOfMonthISO(),
  endDate: todayISO(),
  isLoading: false,
  error: null,

  setDateRange: (startDate, endDate) => set({ startDate, endDate }),

  fetchReport: async () => {
    set({ isLoading: true, error: null })
    try {
      const repo = makeCarUsageReportHttpRepository()
      const report = await makeGetReportService(repo).execute(get().startDate, get().endDate)
      set({ report })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar relatório' })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchPeriods: async () => {
    try {
      const repo = makeReimbursementPeriodHttpRepository()
      const periods = await makeListPeriodsService(repo).execute()
      set({ periods })
    } catch {
      // silently fail — periods are secondary
    }
  },

  closePeriod: async (values) => {
    set({ error: null })
    try {
      const repo = makeReimbursementPeriodHttpRepository()
      const period = await makeClosePeriodService(repo).execute(values)
      set((state) => ({ periods: [period, ...state.periods] }))
      await get().fetchReport()
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao fechar período' })
      throw e
    }
  },
}))
