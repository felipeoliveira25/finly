import type { IMonthlySummaryRepository } from '../../domain/monthlySummary/repository'
import type { MonthlySummary } from '../../domain/monthlySummary/model'

export function makeGetMonthlySummaryService(repo: IMonthlySummaryRepository) {
  return {
    execute: (monthKey: string): Promise<MonthlySummary> => repo.getSummary(monthKey),
  }
}
