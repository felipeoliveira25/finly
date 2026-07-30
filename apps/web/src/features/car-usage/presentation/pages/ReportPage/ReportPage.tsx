import { useEffect, useState } from 'react'
import { useCarUsageReportStore } from '../../state/store/useCarUsageReportStore'
import { CarUsageNav } from '../../components/CarUsageNav/CarUsageNav'
import { StatCard } from '../../components/StatCard/StatCard'
import { TripCard } from '../../components/TripCard/TripCard'
import { formatCurrency, formatKm, formatDate } from '../../utils/format'
import type { CarUsageDayBreakdown } from '../../../domain/carUsageReport/model'

export function ReportPage() {
  const {
    report, periods, startDate, endDate, isLoading, error,
    setDateRange, fetchReport, fetchPeriods, closePeriod,
  } = useCarUsageReportStore()

  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [periodLabel, setPeriodLabel] = useState('')
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    void fetchReport()
    void fetchPeriods()
  }, [])

  const handleFetch = () => void fetchReport()

  const handleClosePeriod = async (e: React.FormEvent) => {
    e.preventDefault()
    setClosing(true)
    try {
      await closePeriod({ label: periodLabel, startDate, endDate })
      setPeriodLabel('')
      setShowCloseForm(false)
    } catch {
      // error shown via store
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="text-lg font-semibold">Relatório</h1>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Date range */}
        <div className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
          <p className="text-text-secondary text-xs uppercase tracking-wide">Período</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-text-secondary text-xs block mb-1">De</label>
              <input
                type="date" value={startDate}
                onChange={(e) => setDateRange(e.target.value, endDate)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-text-secondary text-xs block mb-1">Até</label>
              <input
                type="date" value={endDate}
                onChange={(e) => setDateRange(startDate, e.target.value)}
                className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <button
            onClick={handleFetch} disabled={isLoading}
            className="bg-accent-info text-white font-medium text-sm rounded-lg py-2.5 disabled:opacity-50"
          >
            {isLoading ? 'Carregando...' : 'Buscar'}
          </button>
        </div>

        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {/* Totais */}
        {report && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total km" value={formatKm(report.totalKmMeters)} />
              <StatCard label="Total R$" value={formatCurrency(report.totalCostCents)} variant="negative" />
            </div>

            {/* Breakdown por dia */}
            {report.days.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6 border border-dashed border-border rounded-xl">
                Nenhum trajeto no período.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-text-secondary text-xs uppercase tracking-wide">Por dia</p>
                {report.days.map((day) => (
                  <DayBreakdown
                    key={day.date} day={day}
                    expanded={expandedDay === day.date}
                    onToggle={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                  />
                ))}
              </div>
            )}

            {/* Fechar período */}
            <div className="border-t border-border pt-4">
              <button
                onClick={() => setShowCloseForm(!showCloseForm)}
                className="w-full border border-border rounded-lg py-3 text-sm text-text-secondary hover:text-text-primary hover:border-accent transition-colors"
              >
                {showCloseForm ? 'Cancelar' : 'Fechar período'}
              </button>

              {showCloseForm && (
                <form onSubmit={(e) => void handleClosePeriod(e)} className="mt-3 bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                  <p className="text-text-secondary text-xs">
                    Período: <strong className="text-text-primary">{formatDate(startDate)} → {formatDate(endDate)}</strong>
                  </p>
                  <div>
                    <label className="text-text-secondary text-xs block mb-1">Etiqueta do período</label>
                    <input
                      type="text" placeholder="ex: Julho 2025"
                      value={periodLabel} onChange={(e) => setPeriodLabel(e.target.value)} required
                      className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                  <p className="text-xs text-text-secondary bg-surface-elevated rounded-lg px-3 py-2">
                    Atenção: após fechar, os registros deste período não poderão ser editados.
                  </p>
                  <button
                    type="submit" disabled={closing || !periodLabel}
                    className="bg-accent-negative text-white font-medium text-sm rounded-lg py-3 disabled:opacity-50"
                  >
                    {closing ? 'Fechando...' : 'Confirmar fechamento'}
                  </button>
                </form>
              )}
            </div>
          </>
        )}

        {/* Períodos fechados */}
        {periods.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-text-secondary text-xs uppercase tracking-wide">Períodos fechados</p>
            {periods.map((period) => (
              <div key={period.id} className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">{period.label}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </div>
                <p className="text-text-secondary text-xs">{formatDate(period.startDate)} → {formatDate(period.endDate)}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-accent text-sm">{formatKm(period.totalKmMeters)}</span>
                  <span className="text-accent-negative text-sm">{formatCurrency(period.totalCostCents)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CarUsageNav />
    </div>
  )
}

function DayBreakdown({
  day,
  expanded,
  onToggle,
}: {
  day: CarUsageDayBreakdown
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-text-primary text-sm font-medium">{formatDate(day.date)}</span>
          <span className="text-text-secondary text-xs">{day.trips.length} trajeto{day.trips.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-accent-negative text-sm">{formatCurrency(day.totalCostCents)}</span>
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className={`text-text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </button>
      {expanded && (
        <div className="px-4 pb-3 flex flex-col gap-2 border-t border-border pt-3">
          {day.trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  )
}
