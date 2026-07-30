import { useEffect, useState } from 'react'
import { useCarTripStore } from '../../state/store/useCarTripStore'
import { TripCard } from '../../components/TripCard/TripCard'
import { CarUsageNav } from '../../components/CarUsageNav/CarUsageNav'
import { formatCurrency, formatKm, todayISO } from '../../utils/format'

export function DailyUsagePage() {
  const {
    trips, fixedRoutes, selectedDate, isLoading, error,
    setSelectedDate, fetchData, registerFixedRouteTrip, registerAdHocTrip, removeTrip,
  } = useCarTripStore()

  const [showAdHocForm, setShowAdHocForm] = useState(false)
  const [adHocDistance, setAdHocDistance] = useState('')
  const [adHocDescription, setAdHocDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => { void fetchData() }, [])

  const totalCost = trips.reduce((sum, t) => sum + t.costCents, 0)
  const totalKm = trips.reduce((sum, t) => sum + t.distanceMeters, 0)
  const isToday = selectedDate === todayISO()

  const handleAdHocSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adHocDistance) return
    setSubmitting(true)
    try {
      await registerAdHocTrip(adHocDistance, adHocDescription || undefined)
      setAdHocDistance('')
      setAdHocDescription('')
      setShowAdHocForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold">Registro de Uso</h1>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-accent"
          />
        </div>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Error */}
        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {/* Totais do dia */}
        {trips.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <StatInline label="Total km" value={formatKm(totalKm)} />
            <StatInline label="Total R$" value={formatCurrency(totalCost)} negative />
          </div>
        )}

        {/* Lista de trajetos */}
        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-6">Carregando...</div>
        ) : trips.length === 0 ? (
          <div className="text-text-secondary text-sm text-center py-8 border border-dashed border-border rounded-xl">
            Nenhum trajeto registrado {isToday ? 'hoje' : 'nesta data'}.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onRemove={removeTrip} />
            ))}
          </div>
        )}

        {/* Trajetos fixos */}
        {fixedRoutes.length > 0 && (
          <section>
            <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">Adicionar trajeto fixo</p>
            <div className="flex flex-wrap gap-2">
              {fixedRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => void registerFixedRouteTrip(route)}
                  className="bg-surface border border-border hover:border-accent hover:text-accent text-text-primary text-sm rounded-lg px-3 py-2 transition-colors active:scale-95"
                >
                  {route.name}
                  <span className="ml-1.5 text-text-secondary text-xs">{formatKm(route.distanceMeters)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Trajeto avulso */}
        <section>
          <button
            onClick={() => setShowAdHocForm(!showAdHocForm)}
            className="w-full flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>+ Trajeto avulso</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showAdHocForm ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showAdHocForm && (
            <form onSubmit={(e) => void handleAdHocSubmit(e)} className="mt-2 bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
              <div>
                <label className="text-text-secondary text-xs block mb-1">Distância (km)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="ex: 15.5"
                  value={adHocDistance}
                  onChange={(e) => setAdHocDistance(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  placeholder="ex: Supermercado"
                  value={adHocDescription}
                  onChange={(e) => setAdHocDescription(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                disabled={submitting || !adHocDistance}
                className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50 transition-opacity active:scale-95"
              >
                {submitting ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          )}
        </section>
      </div>

      <CarUsageNav />
    </div>
  )
}

/** Componente auxiliar de stat inline — só usado nesta página */
function StatInline({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3">
      <p className="text-text-secondary text-xs">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${negative ? 'text-accent-negative' : 'text-accent'}`}>{value}</p>
    </div>
  )
}
