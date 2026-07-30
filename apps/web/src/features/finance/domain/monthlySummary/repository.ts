import type { MonthlySummary } from './model'

export interface IMonthlySummaryRepository {
  getSummary(monthKey: string): Promise<MonthlySummary>
}
