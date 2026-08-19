import { useEffect, useState } from 'react'
import { useCarTripStore } from '../../state/store/useCarTripStore'
import { TripCard } from '../../components/TripCard/TripCard'
import { CarUsageNav } from '../../components/CarUsageNav/CarUsageNav'
import { formatCurrency, formatKm, todayISO } from '../../utils/format'
import { isParkingFeeLocked } from '../../../domain/parkingFee/model'
import { isFuelRefillLocked } from '../../../domain/fuelRefill/model'
import type { ParkingFee } from '../../../domain/parkingFee/model'
import type { FuelRefill } from '../../../domain/fuelRefill/model'

export function DailyUsagePage() {
  const {
    trips, fixedRoutes, parkingFees, fuelRefills,
    selectedDate, isLoading, error,
    setSelectedDate, fetchData,
    registerFixedRouteTrip, registerAdHocTrip, removeTrip,
    addParkingFee, removeParkingFee,
    addFuelRefill, removeFuelRefill,
  } = useCarTripStore()

  const [showAdHocForm, setShowAdHocForm] = useState(false)
  const [adHocDistance, setAdHocDistance] = useState('')
  const [adHocDescription, setAdHocDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [showParkingForm, setShowParkingForm] = useState(false)
  const [parkingAmount, setParkingAmount] = useState('')
  const [parkingDescription, setParkingDescription] = useState('')
  const [submittingParking, setSubmittingParking] = useState(false)

  const [showFuelForm, setShowFuelForm] = useState(false)
  const [fuelAmount, setFuelAmount] = useState('')
  const [fuelDescription, setFuelDescription] = useState('')
  const [submittingFuel, setSubmittingFuel] = useState(false)

  useEffect(() => { void fetchData() }, [])

  const totalTripCost = trips.reduce((sum, t) => sum + t.costCents, 0)
  const totalKm = trips.reduce((sum, t) => sum + t.distanceMeters, 0)
  const totalParking = parkingFees.reduce((sum, f) => sum + f.amountCents, 0)
  const totalFuel = fuelRefills.reduce((sum, r) => sum + r.amountCents, 0)
  const netTotal = totalTripCost + totalParking - totalFuel

  const hasAnyEntry = trips.length > 0 || parkingFees.length > 0 || fuelRefills.length > 0
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

  const handleParkingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!parkingAmount) return
    setSubmittingParking(true)
    try {
      await addParkingFee(parkingAmount, parkingDescription || undefined)
      setParkingAmount('')
      setParkingDescription('')
      setShowParkingForm(false)
    } finally {
      setSubmittingParking(false)
    }
  }

  const handleFuelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fuelAmount) return
    setSubmittingFuel(true)
    try {
      await addFuelRefill(fuelAmount, fuelDescription || undefined)
      setFuelAmount('')
      setFuelDescription('')
      setShowFuelForm(false)
    } finally {
      setSubmittingFuel(false)
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
        {hasAnyEntry && (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-3">
              {totalKm > 0 && <StatInline label="Total km" value={formatKm(totalKm)} />}
              <StatInline label="Total líquido" value={formatCurrency(netTotal)} negative />
            </div>
            {(totalParking > 0 || totalFuel > 0) && (
              <div className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1.5 text-xs text-text-secondary">
                {totalTripCost > 0 && (
                  <div className="flex justify-between">
                    <span>Trajetos</span>
                    <span className="text-text-primary">{formatCurrency(totalTripCost)}</span>
                  </div>
                )}
                {totalParking > 0 && (
                  <div className="flex justify-between">
                    <span>Estacionamento</span>
                    <span className="text-text-primary">+ {formatCurrency(totalParking)}</span>
                  </div>
                )}
                {totalFuel > 0 && (
                  <div className="flex justify-between">
                    <span>Abastecimento</span>
                    <span className="text-accent">− {formatCurrency(totalFuel)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Lista de trajetos */}
        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-6">Carregando...</div>
        ) : !hasAnyEntry ? (
          <div className="text-text-secondary text-sm text-center py-8 border border-dashed border-border rounded-xl">
            Nenhum registro {isToday ? 'hoje' : 'nesta data'}.
          </div>
        ) : trips.length > 0 ? (
          <div className="flex flex-col gap-2">
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} onRemove={removeTrip} />
            ))}
          </div>
        ) : null}

        {/* Estacionamentos registrados */}
        {parkingFees.length > 0 && (
          <div className="flex flex-col gap-2">
            {parkingFees.map((fee) => (
              <ParkingFeeCard key={fee.id} fee={fee} onRemove={removeParkingFee} />
            ))}
          </div>
        )}

        {/* Abastecimentos registrados */}
        {fuelRefills.length > 0 && (
          <div className="flex flex-col gap-2">
            {fuelRefills.map((refill) => (
              <FuelRefillCard key={refill.id} refill={refill} onRemove={removeFuelRefill} />
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

        {/* Estacionamento */}
        <section>
          <button
            onClick={() => setShowParkingForm(!showParkingForm)}
            className="w-full flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>+ Estacionamento (Sem Parar)</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showParkingForm ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showParkingForm && (
            <form onSubmit={(e) => void handleParkingSubmit(e)} className="mt-2 bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
              <div>
                <label className="text-text-secondary text-xs block mb-1">Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="ex: 12.00"
                  value={parkingAmount}
                  onChange={(e) => setParkingAmount(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Local (opcional)</label>
                <input
                  type="text"
                  placeholder="ex: Shopping RioMar"
                  value={parkingDescription}
                  onChange={(e) => setParkingDescription(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                disabled={submittingParking || !parkingAmount}
                className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50 transition-opacity active:scale-95"
              >
                {submittingParking ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          )}
        </section>

        {/* Abastecimento */}
        <section>
          <button
            onClick={() => setShowFuelForm(!showFuelForm)}
            className="w-full flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <span>+ Abastecimento (meu cartão)</span>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              className={`transition-transform ${showFuelForm ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {showFuelForm && (
            <form onSubmit={(e) => void handleFuelSubmit(e)} className="mt-2 bg-surface border border-border rounded-lg p-4 flex flex-col gap-3">
              <p className="text-text-secondary text-xs">
                Valores pagos no seu cartão são descontados do total a reembolsar.
              </p>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Valor pago (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="ex: 150.00"
                  value={fuelAmount}
                  onChange={(e) => setFuelAmount(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Posto (opcional)</label>
                <input
                  type="text"
                  placeholder="ex: Posto Ipiranga"
                  value={fuelDescription}
                  onChange={(e) => setFuelDescription(e.target.value)}
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit"
                disabled={submittingFuel || !fuelAmount}
                className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50 transition-opacity active:scale-95"
              >
                {submittingFuel ? 'Registrando...' : 'Registrar'}
              </button>
            </form>
          )}
        </section>

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

function StatInline({ label, value, negative }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="bg-surface border border-border rounded-xl px-4 py-3">
      <p className="text-text-secondary text-xs">{label}</p>
      <p className={`text-xl font-semibold mt-0.5 ${negative ? 'text-accent-negative' : 'text-accent'}`}>{value}</p>
    </div>
  )
}

function ParkingFeeCard({ fee, onRemove }: { fee: ParkingFee; onRemove?: (id: number) => void }) {
  const locked = isParkingFeeLocked(fee)
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-text-primary text-sm font-medium truncate">
          {fee.description ?? 'Estacionamento'}
        </span>
        <span className="text-text-secondary text-xs">Sem Parar</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-accent-negative text-sm font-medium">{formatCurrency(fee.amountCents)}</span>
        {!locked && onRemove && (
          <button
            onClick={() => onRemove(fee.id)}
            className="text-text-secondary hover:text-accent-negative transition-colors p-1"
            aria-label="Remover estacionamento"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        )}
        {locked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        )}
      </div>
    </div>
  )
}

function FuelRefillCard({ refill, onRemove }: { refill: FuelRefill; onRemove?: (id: number) => void }) {
  const locked = isFuelRefillLocked(refill)
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-text-primary text-sm font-medium truncate">
          {refill.description ?? 'Abastecimento'}
        </span>
        <span className="text-text-secondary text-xs">Meu cartão (desconta do total)</span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-accent text-sm font-medium">− {formatCurrency(refill.amountCents)}</span>
        {!locked && onRemove && (
          <button
            onClick={() => onRemove(refill.id)}
            className="text-text-secondary hover:text-accent-negative transition-colors p-1"
            aria-label="Remover abastecimento"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
            </svg>
          </button>
        )}
        {locked && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-text-secondary">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        )}
      </div>
    </div>
  )
}
