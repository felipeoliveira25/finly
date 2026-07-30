// DTOs compartilhados entre apps/web e apps/api

export interface CarUsageConfigDTO {
  id: number
  pricePerLiterCents: number
  avgConsumptionCdkm: number
  effectiveFrom: string // 'YYYY-MM-DD'
  createdAt: string
}

export interface CreateCarUsageConfigDTO {
  pricePerLiterCents: number
  avgConsumptionCdkm: number
  effectiveFrom: string
}

export interface FixedRouteDTO {
  id: number
  name: string
  distanceMeters: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateFixedRouteDTO {
  name: string
  distanceMeters: number
}

export interface UpdateFixedRouteDTO {
  name?: string
  distanceMeters?: number
}

export interface CarTripDTO {
  id: number
  date: string                 // 'YYYY-MM-DD'
  fixedRouteId: number | null
  fixedRouteName: string | null
  distanceMeters: number
  description: string | null
  configId: number
  costCents: number
  periodId: number | null
  createdAt: string
}

export interface CreateCarTripDTO {
  date: string
  fixedRouteId?: number
  distanceMeters: number
  description?: string
}

export interface ReimbursementPeriodDTO {
  id: number
  label: string
  startDate: string
  endDate: string
  totalKmMeters: number
  totalCostCents: number
  closedAt: string
  createdAt: string
}

export interface ClosePeriodDTO {
  label: string
  startDate: string
  endDate: string
}

export interface CarUsageDayBreakdownDTO {
  date: string
  trips: CarTripDTO[]
  totalKmMeters: number
  totalCostCents: number
}

export interface CarUsageReportDTO {
  startDate: string
  endDate: string
  totalKmMeters: number
  totalCostCents: number
  days: CarUsageDayBreakdownDTO[]
}
