/** 162000 -> "R$ 1.620,00" */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100)
}

/**
 * Formata rentabilidade em bps com sinal.
 * null -> 'N/A'
 * 234 -> "+2,34%"
 * -150 -> "-1,50%"
 */
export function formatPercent(bps: number | null): string {
  if (bps === null) return 'N/A'
  const pct = bps / 100
  const formatted = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(pct))
  return `${pct >= 0 ? '+' : '-'}${formatted}%`
}

/** 1425 -> "14,25%" */
export function formatRateBps(bps: number): string {
  const pct = bps / 100
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pct) + '%'
}

/** "2026-07-30" -> "30/07/2026" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

/** Retorna o número de dias até a data ISO fornecida */
export function daysUntil(isoDate: string): number {
  const target = new Date(isoDate + 'T00:00:00Z')
  const now = new Date()
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / msPerDay))
}

/** Formata uma ISO string como "X horas atrás" ou "Y dias atrás" */
export function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days}d atrás`
}
