import { useEffect, useRef } from 'react'
import {
  Chart,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  LinearScale,
  Tooltip,
  Filler,
} from 'chart.js'
import { useInvestmentsStore } from '../../state/store/useInvestmentsStore'
import {
  formatCurrency,
  formatPercent,
  formatRateBps,
  formatDate,
  timeAgo,
} from '../../utils/format'
import type { RentabilityWindowDTO } from '@finly/shared-types'

Chart.register(LineElement, PointElement, LineController, CategoryScale, LinearScale, Tooltip, Filler)

function RentabilityCard({
  label,
  total,
  stocks,
  treasury,
}: {
  label: string
  total: number | null
  stocks: number | null
  treasury: number | null
}) {
  const isPositive = (v: number | null) => v !== null && v >= 0
  const color = (v: number | null) =>
    v === null ? 'text-text-secondary' : v >= 0 ? 'text-accent-positive' : 'text-accent-negative'

  return (
    <div className="bg-surface rounded-xl p-4 flex flex-col gap-1 border border-border">
      <span className="text-xs text-text-secondary font-medium uppercase tracking-wide">{label}</span>
      <span className={`text-xl font-bold ${color(total)}`}>{formatPercent(total)}</span>
      <div className="flex gap-3 mt-1">
        <span className={`text-xs ${color(stocks)}`}>Ações {formatPercent(stocks)}</span>
        <span className={`text-xs ${color(treasury)}`}>Tesouro {formatPercent(treasury)}</span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { portfolio, snapshots, stocks, treasury, options, isLoading, error, fetchAll, triggerSnapshot } =
    useInvestmentsStore()

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    void fetchAll()
  }, [])

  useEffect(() => {
    if (!chartRef.current || snapshots.length === 0) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const labels = snapshots.map((s) => formatDate(s.snapshotDate))
    const data = snapshots.map((s) => s.totalValueCents / 100)

    chartInstance.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Portfólio Total',
            data,
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: snapshots.length > 30 ? 0 : 3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => `R$ ${(ctx.parsed.y as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            },
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => `R$ ${(Number(v) / 1000).toFixed(0)}k`,
            },
          },
        },
      },
    })

    return () => {
      chartInstance.current?.destroy()
    }
  }, [snapshots])

  const rentability = portfolio?.rentability
  const latest = portfolio?.latestSnapshot
  const lastCron = portfolio?.lastCronRun

  const windows: Array<{ label: string; key: keyof RentabilityWindowDTO }> = [
    { label: 'Semana', key: 'week' },
    { label: 'Mês', key: 'month' },
    { label: 'Semestre', key: 'semester' },
    { label: 'Ano', key: 'year' },
  ]

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Investimentos</h1>
        {lastCron && (
          <span className="text-xs text-text-secondary bg-surface border border-border rounded-full px-3 py-1">
            {lastCron.status === 'success' ? 'atualizado' : 'erro'} {timeAgo(lastCron.ranAt)}
          </span>
        )}
      </header>

      <div className="px-4 py-4 flex flex-col gap-6">
        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-12">Carregando...</div>
        ) : (
          <>
            {/* Rentabilidade */}
            {rentability && (
              <section>
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Rentabilidade
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {windows.map(({ label, key }) => (
                    <RentabilityCard
                      key={key}
                      label={label}
                      total={rentability.total[key]}
                      stocks={rentability.stocks[key]}
                      treasury={rentability.treasury[key]}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Resumo do portfólio */}
            {latest && (
              <section className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">
                  Portfólio — {formatDate(latest.snapshotDate)}
                </h2>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Total</span>
                    <span className="text-xl font-bold">{formatCurrency(latest.totalValueCents)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Ações</span>
                    <span className="font-medium">{formatCurrency(latest.stocksValueCents)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-secondary text-sm">Tesouro Direto</span>
                    <span className="font-medium">{formatCurrency(latest.treasuryValueCents)}</span>
                  </div>
                </div>
                <button
                  onClick={() => void triggerSnapshot()}
                  className="text-xs text-text-secondary underline self-end mt-1"
                >
                  Atualizar agora
                </button>
              </section>
            )}

            {/* Gráfico */}
            {snapshots.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Evolução
                </h2>
                <div className="bg-surface border border-border rounded-xl p-4">
                  <canvas ref={chartRef} />
                </div>
              </section>
            )}

            {/* Tesouro Direto */}
            {treasury.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Tesouro Direto
                </h2>
                <div className="flex flex-col gap-3">
                  {treasury.map((app) => (
                    <div
                      key={app.id}
                      className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{app.titleCode}</span>
                        <span className="text-sm font-semibold">{formatCurrency(app.estimatedValueCents)}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-text-secondary">
                        <span>Compra: {formatDate(app.purchaseDate)}</span>
                        <span>Taxa: {formatRateBps(app.contractedRateBps)}</span>
                        <span>Venc.: {formatDate(app.maturityDate)}</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Investido: {formatCurrency(app.investmentAmountCents)}
                        {app.totalRedeemedCents > 0 && (
                          <span className="ml-2 text-accent-negative">
                            — Resgatado: {formatCurrency(app.totalRedeemedCents)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Opções */}
            {options.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Opções
                </h2>
                <div className="flex flex-col gap-3">
                  {options.map((opt) => (
                    <div
                      key={opt.id}
                      className="bg-surface border border-border rounded-xl px-4 py-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{opt.underlyingAsset}</span>
                          <span className="text-xs bg-surface border border-border rounded-full px-2 py-0.5 uppercase">
                            {opt.optionType}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-accent-positive">
                          {opt.daysToExpiry}d
                        </span>
                      </div>
                      {opt.strategyLabel && (
                        <span className="text-xs text-text-secondary">{opt.strategyLabel}</span>
                      )}
                      <div className="grid grid-cols-3 gap-2 text-xs text-text-secondary">
                        <div>
                          <div className="font-medium text-text-primary">POP</div>
                          <div>{formatPercent(opt.popBps)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">Breakeven</div>
                          <div>{formatCurrency(opt.breakevenCents)}</div>
                        </div>
                        <div>
                          <div className="font-medium text-text-primary">Prêmio</div>
                          <div>{formatCurrency(opt.premiumReceivedCents)}</div>
                        </div>
                      </div>
                      <div className="text-xs text-text-secondary">
                        Venc.: {formatDate(opt.expiryDate)} · Qtd: {opt.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ações */}
            {stocks.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  Ações
                </h2>
                <div className="bg-surface border border-border rounded-xl overflow-hidden">
                  {stocks.map((s, idx) => (
                    <div
                      key={s.id}
                      className={`flex justify-between items-center px-4 py-3 ${idx < stocks.length - 1 ? 'border-b border-border' : ''}`}
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{s.ticker}</span>
                        <span className="text-xs text-text-secondary">{s.quantity} cotas</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(s.avgPriceCents)}</div>
                        <div className="text-xs text-text-secondary">PM</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
