import { formatMonthKey, currentMonthISO } from '../../utils/format'

interface MonthSelectorProps {
  monthKey: string
  onPrevious: () => void
  onNext: () => void
}

export function MonthSelector({ monthKey, onPrevious, onNext }: MonthSelectorProps) {
  const isCurrentMonth = monthKey >= currentMonthISO()

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      <button
        onClick={onPrevious}
        className="text-text-secondary hover:text-text-primary transition-colors p-1"
        aria-label="Mês anterior"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>

      <span className="text-text-primary font-medium text-sm min-w-[140px] text-center">
        {formatMonthKey(monthKey)}
      </span>

      <button
        onClick={onNext}
        disabled={isCurrentMonth}
        className="text-text-secondary hover:text-text-primary transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Próximo mês"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  )
}
