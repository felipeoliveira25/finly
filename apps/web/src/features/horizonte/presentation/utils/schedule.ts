import type { TripExpense } from '../../domain/tripExpense/model'

export function addMonths(dateStr: string, n: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  const day = d.getDate()
  d.setMonth(d.getMonth() + n)
  if (d.getDate() < day) d.setDate(0)
  return d.toISOString().slice(0, 10)
}

export function expSchedule(exp: TripExpense): { valorCents: number; data: string }[] {
  const n = Math.max(1, exp.parcelas)
  const total = exp.valorCents
  const base = Math.floor(total / n)
  const arr: { valorCents: number; data: string }[] = []
  let acc = 0
  for (let i = 0; i < n; i++) {
    const valorCents = i === n - 1 ? total - acc : base
    acc += valorCents
    arr.push({ valorCents, data: addMonths(exp.data, i) })
  }
  return arr
}
