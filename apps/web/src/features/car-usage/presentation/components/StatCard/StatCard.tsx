interface StatCardProps {
  label: string
  value: string
  variant?: 'default' | 'negative'
}

export function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  const valueColor = variant === 'negative' ? 'text-accent-negative' : 'text-accent'
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-4 flex flex-col gap-1">
      <span className="text-text-secondary text-xs uppercase tracking-wide">{label}</span>
      <span className={`text-2xl font-semibold ${valueColor}`}>{value}</span>
    </div>
  )
}
