export interface ParkingFee {
  id: number
  date: string                 // 'YYYY-MM-DD'
  amountCents: number
  description: string | null
  periodId: number | null      // null = editável; não-null = somente-leitura
  createdAt: string
}

/** Retorna true se o registro pertence a um período fechado (somente-leitura). */
export function isParkingFeeLocked(fee: ParkingFee): boolean {
  return fee.periodId !== null
}
