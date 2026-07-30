import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useFinanceMonthStore } from '../../state/store/useFinanceMonthStore'
import { useFinanceDashboardStore } from '../../state/store/useFinanceDashboardStore'
import { MonthSelector } from '../../components/MonthSelector/MonthSelector'
import { FinanceNav } from '../../components/FinanceNav/FinanceNav'
import { formatCurrency, formatMonthKey } from '../../utils/format'
import { ROUTES } from '@/shared/constants/routes'

export function DashboardPage() {
  const { currentMonthKey, goToPreviousMonth, goToNextMonth } = useFinanceMonthStore()
  const { summary, isLoading, error, fetchSummary } = useFinanceDashboardStore()

  useEffect(() => {
    void fetchSummary(currentMonthKey)
  }, [currentMonthKey])

  const handlePrevious = () => {
    goToPreviousMonth()
  }

  const handleNext = () => {
    goToNextMonth()
  }

  const incomeCategories = summary?.categoryBreakdown
    .filter((c) => c.type === 'income')
    .sort((a, b) => b.totalCents - a.totalCents) ?? []

  const expenseCategories = summary?.categoryBreakdown
    .filter((c) => c.type === 'expense')
    .sort((a, b) => b.totalCents - a.totalCents) ?? []

  const prevDiff = summary?.previousMonth
    ? summary.balanceCents - summary.previousMonth.balanceCents
    : null

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="text-lg font-semibold">Finanças</h1>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Month selector */}
        <MonthSelector
          monthKey={currentMonthKey}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        {/* Error */}
        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-10">Carregando...</div>
        ) : summary === null ? (
          <div className="text-text-secondary text-sm text-center py-10 border border-dashed border-border rounded-xl">
            Nenhum lançamento registrado.
          </div>
        ) : (
          <>
            {/* Balance card */}
            <div className="bg-surface border border-border rounded-xl px-4 py-5">
              <p className="text-text-secondary text-xs uppercase tracking-wide mb-1">Saldo</p>
              <p className={`text-3xl font-bold ${summary.balanceCents >= 0 ? 'text-accent' : 'text-accent-negative'}`}>
                {formatCurrency(summary.balanceCents)}
              </p>
              <p className="text-text-secondary text-xs mt-2">
                Receitas {formatCurrency(summary.totalIncomeCents)}
                {' · '}
                Despesas {formatCurrency(summary.totalExpensesCents)}
              </p>
            </div>

            {/* Pending banner */}
            {summary.pendingCount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-yellow-500 text-sm">
                  ⚠ {summary.pendingCount} lançamento{summary.pendingCount > 1 ? 's' : ''} pendente{summary.pendingCount > 1 ? 's' : ''} de confirmação
                </span>
                <Link
                  to={ROUTES.FINANCE_TRANSACTIONS}
                  className="text-yellow-500 text-sm font-medium hover:underline ml-2 shrink-0"
                >
                  Ver →
                </Link>
              </div>
            )}

            {/* Previous month comparison */}
            {summary.previousMonth !== null && prevDiff !== null && (
              <div className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center justify-between">
                <span className="text-text-secondary text-sm">
                  vs {formatMonthKey(summary.previousMonth.monthKey)}
                </span>
                <span className={`text-sm font-semibold ${prevDiff >= 0 ? 'text-accent' : 'text-accent-negative'}`}>
                  {prevDiff >= 0 ? '+' : ''}{formatCurrency(prevDiff)}
                </span>
              </div>
            )}

            {/* Breakdown by category */}
            {(incomeCategories.length > 0 || expenseCategories.length > 0) && (
              <div className="flex flex-col gap-4">
                {incomeCategories.length > 0 && (
                  <section>
                    <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">Receitas</p>
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                      {incomeCategories.map((cat, i) => (
                        <div
                          key={cat.categoryId}
                          className={`flex items-center justify-between px-4 py-3 ${
                            i < incomeCategories.length - 1 ? 'border-b border-border' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                            <span className="text-text-primary text-sm">{cat.categoryName}</span>
                          </div>
                          <span className="text-accent text-sm font-medium">{formatCurrency(cat.totalCents)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {expenseCategories.length > 0 && (
                  <section>
                    <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">Despesas</p>
                    <div className="bg-surface border border-border rounded-xl overflow-hidden">
                      {expenseCategories.map((cat, i) => (
                        <div
                          key={cat.categoryId}
                          className={`flex items-center justify-between px-4 py-3 ${
                            i < expenseCategories.length - 1 ? 'border-b border-border' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent-negative shrink-0" />
                            <span className="text-text-primary text-sm">{cat.categoryName}</span>
                          </div>
                          <span className="text-accent-negative text-sm font-medium">{formatCurrency(cat.totalCents)}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <FinanceNav />
    </div>
  )
}
