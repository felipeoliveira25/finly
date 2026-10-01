import { useEffect, useState } from 'react'
import { useCarUsageReportStore } from '../../state/store/useCarUsageReportStore'
import { CarUsageNav } from '../../components/CarUsageNav/CarUsageNav'
import { StatCard } from '../../components/StatCard/StatCard'
import { TripCard } from '../../components/TripCard/TripCard'
import { formatCurrency, formatKm, formatDate } from '../../utils/format'
import { isParkingFeeLocked } from '../../../domain/parkingFee/model'
import { isFuelRefillLocked } from '../../../domain/fuelRefill/model'
import type { CarUsageDayBreakdown } from '../../../domain/carUsageReport/model'
import type { ParkingFee } from '../../../domain/parkingFee/model'
import type { FuelRefill } from '../../../domain/fuelRefill/model'
import type { ReimbursementPeriod } from '../../../domain/reimbursementPeriod/model'
import { generateCarUsagePdf } from '../../utils/generatePdf'
import { makeCarUsageReportHttpRepository } from '../../../infra/services/api/carUsageReport/carUsageReportHttpRepository'

export function ReportPage() {
  const {
    report, periods, startDate, endDate, isLoading, error,
    setDateRange, fetchReport, fetchPeriods, closePeriod,
  } = useCarUsageReportStore()

  const [expandedDay, setExpandedDay] = useState<string | null>(null)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [periodLabel, setPeriodLabel] = useState('')
  const [closing, setClosing] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [generatingPdfForPeriod, setGeneratingPdfForPeriod] = useState<number | null>(null)

  useEffect(() => {
    void fetchReport()
    void fetchPeriods()
  }, [])

  const handleFetch = () => void fetchReport()

  const handleGeneratePdf = async () => {
    if (!report) return
    setGeneratingPdf(true)
    try {
      generateCarUsagePdf(report)
    } finally {
      setGeneratingPdf(false)
    }
  }

  const handleGeneratePdfForPeriod = async (period: ReimbursementPeriod) => {
    setGeneratingPdfForPeriod(period.id)
    try {
      const repo = makeCarUsageReportHttpRepository()
      const periodReport = await repo.getReport(period.startDate, period.endDate)
      generateCarUsagePdf(periodReport, period.label)
    } finally {
      setGeneratingPdfForPeriod(null)
    }
  }

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
              <StatCard label="Total líquido" value={formatCurrency(report.totalCostCents)} variant="negative" />
            </div>

            {/* Breakdown de estacionamento/abastecimento se houver */}
            {(report.totalParkingCents > 0 || report.totalFuelRefillCents > 0) && (
              <div className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Trajetos</span>
                  <span className="text-text-primary">{formatCurrency(report.totalCostCents - report.totalParkingCents + report.totalFuelRefillCents)}</span>
                </div>
                {report.totalParkingCents > 0 && (
                  <div className="flex justify-between">
                    <span>Estacionamento</span>
                    <span className="text-text-primary">+ {formatCurrency(report.totalParkingCents)}</span>
                  </div>
                )}
                {report.totalFuelRefillCents > 0 && (
                  <div className="flex justify-between">
                    <span>Abastecimento (seu cartão)</span>
                    <span className="text-accent">− {formatCurrency(report.totalFuelRefillCents)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Breakdown por dia */}
            {report.days.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6 border border-dashed border-border rounded-xl">
                Nenhum registro no período.
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

            {/* Ações do período */}
            <div className="border-t border-border pt-4 flex flex-col gap-2">
              <button
                onClick={() => void handleGeneratePdf()}
                disabled={generatingPdf}
                className="w-full flex items-center justify-center gap-2 border border-border rounded-lg py-3 text-sm text-text-secondary hover:text-text-primary hover:border-accent-info transition-colors disabled:opacity-50"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                {generatingPdf ? 'Gerando PDF...' : 'Gerar PDF do período'}
              </button>

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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => void handleGeneratePdfForPeriod(period)}
                      disabled={generatingPdfForPeriod === period.id}
                      className="text-text-secondary hover:text-accent-info transition-colors disabled:opacity-50"
                      title="Baixar PDF"
                    >
                      {generatingPdfForPeriod === period.id ? (
                        <span className="text-xs">...</span>
                      ) : (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      )}
                    </button>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                </div>
                <p className="text-text-secondary text-xs">{formatDate(period.startDate)} → {formatDate(period.endDate)}</p>
                <div className="flex gap-4 mt-1">
                  <span className="text-accent text-sm">{formatKm(period.totalKmMeters)}</span>
                  <span className="text-accent-negative text-sm">{formatCurrency(period.totalCostCents)}</span>
                </div>
                {(period.totalParkingCents > 0 || period.totalFuelRefillCents > 0) && (
                  <div className="flex flex-col gap-0.5 mt-1">
                    {period.totalParkingCents > 0 && (
                      <span className="text-text-secondary text-xs">
                        Estacionamento: {formatCurrency(period.totalParkingCents)}
                      </span>
                    )}
                    {period.totalFuelRefillCents > 0 && (
                      <span className="text-text-secondary text-xs">
                        Abastecimento: − {formatCurrency(period.totalFuelRefillCents)}
                      </span>
                    )}
                  </div>
                )}
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
  const entryCount = day.trips.length + day.parkingFees.length + day.fuelRefills.length

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-3">
          <span className="text-text-primary text-sm font-medium">{formatDate(day.date)}</span>
          <span className="text-text-secondary text-xs">{entryCount} registro{entryCount !== 1 ? 's' : ''}</span>
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
          {day.parkingFees.map((fee) => (
            <ReadOnlyParkingCard key={fee.id} fee={fee} />
          ))}
          {day.fuelRefills.map((refill) => (
            <ReadOnlyFuelCard key={refill.id} refill={refill} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReadOnlyParkingCard({ fee }: { fee: ParkingFee }) {
  return (
    <div className="flex items-center justify-between bg-surface-elevated border border-border rounded-lg px-4 py-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-text-primary text-sm font-medium truncate">
          {fee.description ?? 'Estacionamento'}
        </span>
        <span className="text-text-secondary text-xs">Sem Parar</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-accent-negative text-sm font-medium">{formatCurrency(fee.amountCents)}</span>
        {isParkingFeeLocked(fee) && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        )}
      </div>
    </div>
  )
}

function ReadOnlyFuelCard({ refill }: { refill: FuelRefill }) {
  return (
    <div className="flex items-center justify-between bg-surface-elevated border border-border rounded-lg px-4 py-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-text-primary text-sm font-medium truncate">
          {refill.description ?? 'Abastecimento'}
        </span>
        <span className="text-text-secondary text-xs">Meu cartão</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-accent text-sm font-medium">− {formatCurrency(refill.amountCents)}</span>
        {isFuelRefillLocked(refill) && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        )}
      </div>
    </div>
  )
}
