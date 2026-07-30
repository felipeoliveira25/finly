import type { CarUsageReport } from './model'

export interface ICarUsageReportRepository {
  getReport(startDate: string, endDate: string): Promise<CarUsageReport>
}
