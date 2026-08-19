import type { CarUsageReportDTO, CarUsageDayBreakdownDTO } from '@finly/shared-types'
import { hydrateCarTrip } from '../carTrip/factory'
import { hydrateParkingFee } from '../parkingFee/factory'
import { hydrateFuelRefill } from '../fuelRefill/factory'
import type { CarUsageReport, CarUsageDayBreakdown } from './model'

function hydrateDayBreakdown(dto: CarUsageDayBreakdownDTO): CarUsageDayBreakdown {
  return {
    date: dto.date,
    trips: dto.trips.map(hydrateCarTrip),
    parkingFees: dto.parkingFees.map(hydrateParkingFee),
    fuelRefills: dto.fuelRefills.map(hydrateFuelRefill),
    totalKmMeters: dto.totalKmMeters,
    totalCostCents: dto.totalCostCents,
    totalParkingCents: dto.totalParkingCents,
    totalFuelRefillCents: dto.totalFuelRefillCents,
  }
}

export function hydrateCarUsageReport(dto: CarUsageReportDTO): CarUsageReport {
  return {
    startDate: dto.startDate,
    endDate: dto.endDate,
    totalKmMeters: dto.totalKmMeters,
    totalCostCents: dto.totalCostCents,
    totalParkingCents: dto.totalParkingCents,
    totalFuelRefillCents: dto.totalFuelRefillCents,
    days: dto.days.map(hydrateDayBreakdown),
  }
}
