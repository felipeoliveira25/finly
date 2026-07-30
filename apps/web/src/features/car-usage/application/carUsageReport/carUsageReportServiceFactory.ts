import type { ICarUsageReportRepository } from '../../domain/carUsageReport/repository'
import type { CarUsageReport } from '../../domain/carUsageReport/model'

export function makeGetReportService(repo: ICarUsageReportRepository) {
  return {
    execute: (startDate: string, endDate: string): Promise<CarUsageReport> =>
      repo.getReport(startDate, endDate),
  }
}
