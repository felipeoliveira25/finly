/** 629 → "R$ 6,29" */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/** 8300 → "8,3 km" | 8000 → "8 km" */
export function formatKm(meters: number): string {
  const km = meters / 1000
  return (
    new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(
      km,
    ) + ' km'
  )
}

/** "2025-07-30" → "30/07/2025" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/** Returns today as 'YYYY-MM-DD' */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}
