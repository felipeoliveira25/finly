import { useEffect, useState } from 'react'
import { useCarUsageSettingsStore } from '../../state/store/useCarUsageSettingsStore'
import { CarUsageNav } from '../../components/CarUsageNav/CarUsageNav'
import { formatKm, formatCurrency, formatDate, todayISO } from '../../utils/format'
import type { FixedRoute } from '../../../domain/fixedRoute/model'
import type { CarUsageConfig } from '../../../domain/carUsageConfig/model'

type Tab = 'routes' | 'config'

export function SettingsPage() {
  const {
    fixedRoutes, configs, isLoading, error,
    fetchData, createFixedRoute, archiveFixedRoute, createConfig,
  } = useCarUsageSettingsStore()

  const [tab, setTab] = useState<Tab>('routes')

  // New route form state
  const [routeName, setRouteName] = useState('')
  const [routeDistance, setRouteDistance] = useState('')
  const [routeSubmitting, setRouteSubmitting] = useState(false)

  // New config form state
  const [pricePerLiter, setPricePerLiter] = useState('')
  const [avgConsumption, setAvgConsumption] = useState('')
  const [effectiveFrom, setEffectiveFrom] = useState(todayISO())
  const [configSubmitting, setConfigSubmitting] = useState(false)

  useEffect(() => { void fetchData() }, [])

  const activeConfig = configs[0] ?? null

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    setRouteSubmitting(true)
    try {
      await createFixedRoute({ name: routeName, distanceKm: routeDistance })
      setRouteName('')
      setRouteDistance('')
    } catch {
      // error shown via store
    } finally {
      setRouteSubmitting(false)
    }
  }

  const handleCreateConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    setConfigSubmitting(true)
    try {
      await createConfig({ pricePerLiter, avgConsumptionKmL: avgConsumption, effectiveFrom })
      setPricePerLiter('')
      setAvgConsumption('')
      setEffectiveFrom(todayISO())
    } catch {
      // error shown via store
    } finally {
      setConfigSubmitting(false)
    }
  }

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-medium transition-colors ${
      tab === t
        ? 'text-text-primary border-b-2 border-accent'
        : 'text-text-secondary border-b-2 border-transparent'
    }`

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="text-lg font-semibold">Configurações</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        <button className={tabClass('routes')} onClick={() => setTab('routes')}>Trajetos Fixos</button>
        <button className={tabClass('config')} onClick={() => setTab('config')}>Parâmetros</button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-6">Carregando...</div>
        ) : tab === 'routes' ? (
          <>
            {/* Lista de trajetos fixos */}
            {fixedRoutes.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6 border border-dashed border-border rounded-xl">
                Nenhum trajeto fixo cadastrado.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {fixedRoutes.map((route) => (
                  <RouteItem key={route.id} route={route} onArchive={archiveFixedRoute} />
                ))}
              </div>
            )}

            {/* Formulário novo trajeto */}
            <form onSubmit={(e) => void handleCreateRoute(e)} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
              <p className="text-text-secondary text-xs uppercase tracking-wide">Novo trajeto fixo</p>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Nome</label>
                <input
                  type="text" placeholder="ex: Casa → Ferreira Costa"
                  value={routeName} onChange={(e) => setRouteName(e.target.value)} required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Distância (km)</label>
                <input
                  type="number" step="0.1" min="0.1" placeholder="ex: 8"
                  value={routeDistance} onChange={(e) => setRouteDistance(e.target.value)} required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit" disabled={routeSubmitting}
                className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50"
              >
                {routeSubmitting ? 'Salvando...' : 'Adicionar trajeto'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Config atual */}
            {activeConfig && (
              <div className="bg-surface border border-accent/30 rounded-xl p-4">
                <p className="text-accent text-xs uppercase tracking-wide mb-2">Configuração ativa</p>
                <ConfigRow config={activeConfig} />
              </div>
            )}

            {/* Histórico */}
            {configs.length > 1 && (
              <div className="flex flex-col gap-2">
                <p className="text-text-secondary text-xs uppercase tracking-wide">Histórico</p>
                {configs.slice(1).map((c) => (
                  <div key={c.id} className="bg-surface border border-border rounded-lg p-3 opacity-60">
                    <ConfigRow config={c} />
                  </div>
                ))}
              </div>
            )}

            {/* Formulário nova config */}
            <form onSubmit={(e) => void handleCreateConfig(e)} className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
              <p className="text-text-secondary text-xs uppercase tracking-wide">Nova configuração</p>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Preço da gasolina (R$/L)</label>
                <input
                  type="number" step="0.01" min="0.01" placeholder="ex: 6.29"
                  value={pricePerLiter} onChange={(e) => setPricePerLiter(e.target.value)} required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Consumo médio (km/L)</label>
                <input
                  type="number" step="0.1" min="0.1" placeholder="ex: 12.5"
                  value={avgConsumption} onChange={(e) => setAvgConsumption(e.target.value)} required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <div>
                <label className="text-text-secondary text-xs block mb-1">Vigência a partir de</label>
                <input
                  type="date"
                  value={effectiveFrom} onChange={(e) => setEffectiveFrom(e.target.value)} required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>
              <button
                type="submit" disabled={configSubmitting}
                className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50"
              >
                {configSubmitting ? 'Salvando...' : 'Salvar configuração'}
              </button>
            </form>
          </>
        )}
      </div>

      <CarUsageNav />
    </div>
  )
}

function RouteItem({ route, onArchive }: { route: FixedRoute; onArchive: (id: number) => Promise<void> }) {
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <div>
        <p className="text-text-primary text-sm font-medium">{route.name}</p>
        <p className="text-text-secondary text-xs">{formatKm(route.distanceMeters)}</p>
      </div>
      <button
        onClick={() => void onArchive(route.id)}
        className="text-text-secondary hover:text-accent-negative transition-colors p-1"
        aria-label="Arquivar trajeto"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    </div>
  )
}

function ConfigRow({ config }: { config: CarUsageConfig }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Preço/L</span>
        <span className="text-text-primary">{formatCurrency(config.pricePerLiterCents)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Consumo</span>
        <span className="text-text-primary">{(config.avgConsumptionCdkm / 100).toFixed(1)} km/L</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text-secondary">Vigência</span>
        <span className="text-text-primary">{formatDate(config.effectiveFrom)}</span>
      </div>
    </div>
  )
}
