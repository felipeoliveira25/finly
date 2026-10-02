import { useEffect, useState } from 'react'
import { useHorizonteStore } from '../state/store/useHorizonteStore'
import { expSchedule } from '../utils/schedule'
import type { TripExpense } from '../../domain/tripExpense/model'

const CATEGORIAS = [
  'Hospedagem',
  'Alimentação',
  'Combustível',
  'Locação de carro',
  'Passeios',
  'Outros',
] as const

const CAT_COLORS: Record<string, string> = {
  Hospedagem: '#1D4E89',
  Alimentação: '#2E86AB',
  Combustível: '#5B7FA6',
  'Locação de carro': '#16324F',
  Passeios: '#4FA9D8',
  Outros: '#8FA6C0',
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMonthYear(dateStr: string): string {
  const [year, month] = dateStr.split('-')
  const d = new Date(Number(year), Number(month) - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function currentMonthKey(): string {
  return new Date().toISOString().slice(0, 7)
}

interface MonthGroup {
  monthKey: string
  items: {
    expense: TripExpense
    parcelaIndex: number
    valorCents: number
    data: string
  }[]
}

function buildMonthGroups(expenses: TripExpense[]): MonthGroup[] {
  const map = new Map<string, MonthGroup['items']>()

  for (const exp of expenses) {
    const schedule = expSchedule(exp)
    for (let i = 0; i < schedule.length; i++) {
      const { valorCents, data } = schedule[i]
      const monthKey = data.slice(0, 7)
      if (!map.has(monthKey)) map.set(monthKey, [])
      map.get(monthKey)!.push({ expense: exp, parcelaIndex: i, valorCents, data })
    }
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, items]) => ({
      monthKey,
      items: items.sort((a, b) => a.data.localeCompare(b.data)),
    }))
}

interface AddExpenseForm {
  desc: string
  cat: string
  valorReais: string
  data: string
  parcelas: string
}

export function HorizontePage() {
  const { expenses, loading, error, fetchExpenses, addExpense, togglePaid, removeExpense } =
    useHorizonteStore()

  const [form, setForm] = useState<AddExpenseForm>({
    desc: '',
    cat: 'Hospedagem',
    valorReais: '',
    data: todayISO(),
    parcelas: '1',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set())

  useEffect(() => {
    void fetchExpenses()
  }, [fetchExpenses])

  // Auto-collapse past months on first load
  useEffect(() => {
    if (expenses.length === 0) return
    const groups = buildMonthGroups(expenses)
    const thisMonth = currentMonthKey()
    const toCollapse = new Set<string>()
    for (const g of groups) {
      if (g.monthKey < thisMonth) toCollapse.add(g.monthKey)
    }
    setCollapsedMonths(toCollapse)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses.length])

  const totalCents = expenses.reduce((acc, e) => acc + e.valorCents, 0)
  const porPessoaCents = Math.round(totalCents / 2)

  // By category
  const catTotals = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.cat] = (acc[e.cat] ?? 0) + e.valorCents
    return acc
  }, {})

  // Monthly groups
  const monthGroups = buildMonthGroups(expenses)
  const thisMonth = currentMonthKey()

  // Upcoming unpaid installments
  const today = todayISO()
  const upcoming: { expense: TripExpense; parcelaIndex: number; valorCents: number; data: string }[] = []
  for (const exp of expenses) {
    const schedule = expSchedule(exp)
    for (let i = 0; i < schedule.length; i++) {
      const { valorCents, data } = schedule[i]
      if (!exp.paid[i] && data >= today) {
        upcoming.push({ expense: exp, parcelaIndex: i, valorCents, data })
      }
    }
  }
  upcoming.sort((a, b) => a.data.localeCompare(b.data))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    try {
      await addExpense(form)
      setForm({ desc: '', cat: 'Hospedagem', valorReais: '', data: todayISO(), parcelas: '1' })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erro ao adicionar gasto')
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMonth(key: string) {
    setCollapsedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-6 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">Horizonte ✈</h1>
        <p className="text-neutral-400 text-sm">Gastos da viagem · Eduarda &amp; Felipe</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <p className="text-neutral-400 text-xs uppercase tracking-wide">Total geral</p>
          <p className="text-xl font-semibold text-green-400">{formatBRL(totalCents)}</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-1">
          <p className="text-neutral-400 text-xs uppercase tracking-wide">Por pessoa</p>
          <p className="text-xl font-semibold text-green-400">{formatBRL(porPessoaCents)}</p>
        </div>
      </div>

      {/* Form */}
      <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
        <h2 className="text-base font-semibold">Novo gasto</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3">
          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="desc">
              Descrição
            </label>
            <input
              id="desc"
              type="text"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-green-500"
              placeholder="Ex: Hotel em Lisboa"
              value={form.desc}
              onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
              required
            />
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="cat">
              Categoria
            </label>
            <select
              id="cat"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-green-500"
              value={form.cat}
              onChange={(e) => setForm((f) => ({ ...f, cat: e.target.value }))}
            >
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-400 mb-1" htmlFor="valorReais">
                Valor (R$)
              </label>
              <input
                id="valorReais"
                type="number"
                min="0.01"
                step="0.01"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-green-500"
                placeholder="0,00"
                value={form.valorReais}
                onChange={(e) => setForm((f) => ({ ...f, valorReais: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-400 mb-1" htmlFor="parcelas">
                Parcelas
              </label>
              <input
                id="parcelas"
                type="number"
                min="1"
                step="1"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-green-500"
                value={form.parcelas}
                onChange={(e) => setForm((f) => ({ ...f, parcelas: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-400 mb-1" htmlFor="data">
              Data da 1ª parcela
            </label>
            <input
              id="data"
              type="date"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-neutral-100 focus:outline-none focus:border-green-500"
              value={form.data}
              onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
              required
            />
          </div>

          {formError && (
            <p className="text-red-400 text-xs">{formError}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-500 hover:bg-green-400 disabled:bg-green-900 disabled:text-green-600 text-black font-semibold rounded-lg py-2.5 text-sm transition-colors"
          >
            {submitting ? 'Adicionando…' : 'Adicionar'}
          </button>
        </form>
      </section>

      {/* Expense list */}
      {expenses.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Gastos ({expenses.length})</h2>
          <div className="space-y-2">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-start gap-3"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium truncate">{exp.desc}</span>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full text-white font-medium shrink-0"
                      style={{ backgroundColor: CAT_COLORS[exp.cat] ?? '#555' }}
                    >
                      {exp.cat}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">
                    {exp.data} · {exp.parcelas}x de {formatBRL(Math.floor(exp.valorCents / exp.parcelas))}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-neutral-300">
                    <span>Total: <span className="text-green-400 font-medium">{formatBRL(exp.valorCents)}</span></span>
                    <span>Cada um: <span className="text-green-400 font-medium">{formatBRL(Math.round(exp.valorCents / 2))}</span></span>
                  </div>
                </div>
                <button
                  onClick={() => void removeExpense(exp.id)}
                  className="text-neutral-500 hover:text-red-400 text-lg leading-none shrink-0 transition-colors"
                  aria-label={`Remover ${exp.desc}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* By category */}
      {Object.keys(catTotals).length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Por categoria</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
            {CATEGORIAS.filter((c) => (catTotals[c] ?? 0) > 0).map((cat) => {
              const val = catTotals[cat] ?? 0
              const pct = totalCents > 0 ? Math.round((val / totalCents) * 100) : 0
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-neutral-300">{cat}</span>
                    <span className="text-neutral-400">{formatBRL(val)} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: CAT_COLORS[cat] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Monthly view */}
      {monthGroups.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Visão mensal</h2>
          <div className="space-y-3">
            {monthGroups.map((group) => {
              const isCurrentMonth = group.monthKey === thisMonth
              const isCollapsed = collapsedMonths.has(group.monthKey)
              const monthTotal = group.items.reduce((acc, i) => acc + i.valorCents, 0)
              const paidCount = group.items.filter((i) => i.expense.paid[i.parcelaIndex]).length

              return (
                <div
                  key={group.monthKey}
                  className={`border rounded-xl overflow-hidden ${
                    isCurrentMonth
                      ? 'border-green-800 bg-green-950/20'
                      : 'border-neutral-800 bg-neutral-900'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleMonth(group.monthKey)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <div>
                      <span
                        className={`text-sm font-semibold capitalize ${
                          isCurrentMonth ? 'text-green-400' : 'text-neutral-100'
                        }`}
                      >
                        {formatMonthYear(group.monthKey + '-01')}
                        {isCurrentMonth && (
                          <span className="ml-2 text-xs font-normal text-green-500 bg-green-950 px-1.5 py-0.5 rounded-full">
                            atual
                          </span>
                        )}
                      </span>
                      <p className="text-xs text-neutral-400 mt-0.5">
                        {formatBRL(monthTotal)} · cada um {formatBRL(Math.round(monthTotal / 2))} · {paidCount}/{group.items.length} pago(s)
                      </p>
                    </div>
                    <span className="text-neutral-500 text-sm">{isCollapsed ? '▶' : '▼'}</span>
                  </button>

                  {!isCollapsed && (
                    <div className="border-t border-neutral-800 divide-y divide-neutral-800">
                      {group.items.map((item) => {
                        const isPaid = item.expense.paid[item.parcelaIndex] ?? false
                        const isOverdue = !isPaid && item.data < today

                        return (
                          <div
                            key={`${item.expense.id}-${item.parcelaIndex}`}
                            className="px-4 py-3 flex items-center gap-3"
                          >
                            <button
                              type="button"
                              onClick={() =>
                                void togglePaid(item.expense.id, item.parcelaIndex, isPaid)
                              }
                              className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isPaid
                                  ? 'border-green-500 bg-green-500 text-black'
                                  : 'border-neutral-600 hover:border-green-500'
                              }`}
                              aria-label={isPaid ? 'Marcar como pendente' : 'Marcar como pago'}
                            >
                              {isPaid && (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm truncate ${
                                  isPaid
                                    ? 'line-through text-neutral-500'
                                    : isOverdue
                                    ? 'text-red-400'
                                    : 'text-neutral-100'
                                }`}
                              >
                                {item.expense.desc}
                                {item.expense.parcelas > 1 && (
                                  <span className="ml-1 text-xs text-neutral-500">
                                    {item.parcelaIndex + 1}/{item.expense.parcelas}
                                  </span>
                                )}
                              </p>
                              <p
                                className={`text-xs ${isOverdue && !isPaid ? 'text-red-500' : 'text-neutral-500'}`}
                              >
                                {item.data}
                                {isOverdue && !isPaid && ' · em atraso'}
                              </p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className={`text-sm font-medium ${isPaid ? 'text-neutral-500' : 'text-neutral-100'}`}>
                                {formatBRL(item.valorCents)}
                              </p>
                              <p className="text-xs text-neutral-500">
                                cada um {formatBRL(Math.round(item.valorCents / 2))}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Upcoming payments */}
      {upcoming.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">Próximos pagamentos</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl divide-y divide-neutral-800">
            {upcoming.map((item) => {
              const isOverdue = item.data < today

              return (
                <div
                  key={`upcoming-${item.expense.id}-${item.parcelaIndex}`}
                  className="px-4 py-3 flex items-center gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium truncate ${
                        isOverdue ? 'text-red-400' : 'text-neutral-100'
                      }`}
                    >
                      {item.expense.desc}
                      {item.expense.parcelas > 1 && (
                        <span className="ml-1 text-xs text-neutral-500">
                          {item.parcelaIndex + 1}/{item.expense.parcelas}
                        </span>
                      )}
                    </p>
                    <p
                      className={`text-xs ${isOverdue ? 'text-red-500' : 'text-neutral-500'}`}
                    >
                      {item.data}
                      {isOverdue && ' · em atraso'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-medium text-neutral-100">
                      {formatBRL(item.valorCents)}
                    </p>
                    <p className="text-xs text-neutral-500">
                      cada um {formatBRL(Math.round(item.valorCents / 2))}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Loading state */}
      {loading && expenses.length === 0 && (
        <div className="flex items-center justify-center py-12 text-neutral-500 text-sm">
          Carregando…
        </div>
      )}

      {/* Empty state */}
      {!loading && expenses.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
          <p className="text-4xl">✈</p>
          <p className="text-neutral-400 text-sm">Nenhum gasto cadastrado ainda.</p>
          <p className="text-neutral-600 text-xs">Adicione o primeiro gasto da viagem acima.</p>
        </div>
      )}
    </main>
  )
}
