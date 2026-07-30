import type { CarTrip } from '../carTrip/model'

export interface CarUsageDayBreakdown {
  date: string
  trips: CarTrip[]
  totalKmMeters: number
  totalCostCents: number
}

export interface CarUsageReport {
  startDate: string
  endDate: string
  totalKmMeters: number
  totalCostCents: number
  days: CarUsageDayBreakdown[]
}
