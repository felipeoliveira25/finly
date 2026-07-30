/** 300000 → "R$ 3.000,00" */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/** "2025-07" → "Julho de 2025" */
export function formatMonthKey(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  const d = new Date(year, month - 1, 1)
  const name = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return name.charAt(0).toUpperCase() + name.slice(1)
}

/** "2025-07-15" → "15/07/2025" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/** Returns current month as 'YYYY-MM' */
export function currentMonthISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Returns today as 'YYYY-MM-DD' */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Navigate months: addMonths('2025-07', -1) → '2025-06' */
export function addMonths(monthKey: string, delta: number): string {
  const [year, month] = monthKey.split('-').map(Number)
  const d = new Date(year, month - 1 + delta, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
