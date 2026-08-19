import type { CarTrip } from '../carTrip/model'

export interface ReimbursementPeriod {
  id: number
  label: string
  startDate: string
  endDate: string
  totalKmMeters: number
  totalCostCents: number       // total líquido: trajetos + estacionamento - abastecimento
  totalParkingCents: number
  totalFuelRefillCents: number
  closedAt: string
  createdAt: string
}

export interface ReimbursementPeriodDetail extends ReimbursementPeriod {
  trips: CarTrip[]
}
