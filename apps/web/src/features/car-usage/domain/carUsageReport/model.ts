import type { CarTrip } from '../carTrip/model'
import type { ParkingFee } from '../parkingFee/model'
import type { FuelRefill } from '../fuelRefill/model'

export interface CarUsageDayBreakdown {
  date: string
  trips: CarTrip[]
  parkingFees: ParkingFee[]
  fuelRefills: FuelRefill[]
  totalKmMeters: number
  totalCostCents: number       // total líquido do dia
  totalParkingCents: number
  totalFuelRefillCents: number
}

export interface CarUsageReport {
  startDate: string
  endDate: string
  totalKmMeters: number
  totalCostCents: number       // total líquido do período
  totalParkingCents: number
  totalFuelRefillCents: number
  days: CarUsageDayBreakdown[]
}
