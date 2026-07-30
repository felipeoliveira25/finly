export interface CarTrip {
  id: number
  date: string                  // 'YYYY-MM-DD'
  fixedRouteId: number | null   // null = trajeto avulso
  fixedRouteName: string | null
  distanceMeters: number
  description: string | null
  configId: number
  costCents: number
  periodId: number | null       // null = editável; não-null = somente-leitura
  createdAt: string
}

/** Retorna true se o trajeto pertence a um período fechado (somente-leitura). */
export function isLocked(trip: CarTrip): boolean {
  return trip.periodId !== null
}
