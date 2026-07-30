import type { CarTrip } from '../../../domain/carTrip/model'
import { isLocked } from '../../../domain/carTrip/model'
import { formatCurrency, formatKm } from '../../utils/format'

interface TripCardProps {
  trip: CarTrip
  onRemove?: (id: number) => void
}

export function TripCard({ trip, onRemove }: TripCardProps) {
  const name = trip.fixedRouteName ?? (trip.description || 'Avulso')
  const locked = isLocked(trip)

  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-text-primary text-sm font-medium truncate">{name}</span>
        <span className="text-text-secondary text-xs">{formatKm(trip.distanceMeters)}</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-accent-negative text-sm font-medium">{formatCurrency(trip.costCents)}</span>
        {!locked && onRemove && (
          <button
            onClick={() => onRemove(trip.id)}
            className="text-text-secondary hover:text-accent-negative transition-colors p-1"
            aria-label="Remover trajeto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        )}
        {locked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary" aria-label="Período fechado">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        )}
      </div>
    </div>
  )
}
