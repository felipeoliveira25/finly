import { apiFetch } from '@/lib/api'
import type { CarUsageReportDTO } from '@finly/shared-types'
import { hydrateCarUsageReport } from '../../../../domain/carUsageReport/factory'
import type { ICarUsageReportRepository } from '../../../../domain/carUsageReport/repository'

export function makeCarUsageReportHttpRepository(): ICarUsageReportRepository {
  return {
    getReport: async (startDate: string, endDate: string) => {
      const dto = await apiFetch<CarUsageReportDTO>(
        `/car-usage/report?startDate=${startDate}&endDate=${endDate}`,
      )
      return hydrateCarUsageReport(dto)
    },
  }
}
