import { apiFetch } from '@/lib/api'
import type { MonthlySummaryDTO } from '@finly/shared-types'
import { hydrateMonthlySummary } from '../../../../domain/monthlySummary/factory'
import type { IMonthlySummaryRepository } from '../../../../domain/monthlySummary/repository'

export function makeMonthlySummaryHttpRepository(): IMonthlySummaryRepository {
  return {
    getSummary: async (monthKey: string) => {
      const dto = await apiFetch<MonthlySummaryDTO>(`/finance/summary/${monthKey}`)
      return hydrateMonthlySummary(dto)
    },
  }
}
