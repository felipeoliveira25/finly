import type { CarUsageReportDTO, CarUsageDayBreakdownDTO } from '@finly/shared-types'
import { hydrateCarTrip } from '../carTrip/factory'
import type { CarUsageReport, CarUsageDayBreakdown } from './model'

function hydrateDayBreakdown(dto: CarUsageDayBreakdownDTO): CarUsageDayBreakdown {
  return {
    date: dto.date,
    trips: dto.trips.map(hydrateCarTrip),
    totalKmMeters: dto.totalKmMeters,
    totalCostCents: dto.totalCostCents,
  }
}

export function hydrateCarUsageReport(dto: CarUsageReportDTO): CarUsageReport {
  return {
    startDate: dto.startDate,
    endDate: dto.endDate,
    totalKmMeters: dto.totalKmMeters,
    totalCostCents: dto.totalCostCents,
    days: dto.days.map(hydrateDayBreakdown),
  }
}
