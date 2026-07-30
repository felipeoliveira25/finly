import { useEffect, useState } from 'react'
import { useFinanceMonthStore } from '../../state/store/useFinanceMonthStore'
import { useFinanceTransactionsStore } from '../../state/store/useFinanceTransactionsStore'
import { MonthSelector } from '../../components/MonthSelector/MonthSelector'
import { TransactionItem } from '../../components/TransactionItem/TransactionItem'
import { FinanceNav } from '../../components/FinanceNav/FinanceNav'
import { isRecurring, isPending } from '../../../domain/transaction/model'
import { todayISO } from '../../utils/format'
import type { TransactionType } from '@finly/shared-types'

export function TransactionsPage() {
  const { currentMonthKey, goToPreviousMonth, goToNextMonth } = useFinanceMonthStore()
  const {
    transactions,
    categories,
    isLoading,
    error,
    lastGenerated,
    fetchData,
    generateRecurring,
    createTransaction,
    confirmRecurring,
    removeTransaction,
  } = useFinanceTransactionsStore()

  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<TransactionType>('expense')
  const [formCategoryId, setFormCategoryId] = useState<number>(0)
  const [formAmount, setFormAmount] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formDate, setFormDate] = useState(todayISO())
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [generateMsg, setGenerateMsg] = useState<string | null>(null)

  useEffect(() => {
    void fetchData(currentMonthKey)
  }, [currentMonthKey])

  useEffect(() => {
    if (lastGenerated === null) return
    const msg =
      lastGenerated > 0
        ? `${lastGenerated} lançamento${lastGenerated > 1 ? 's' : ''} gerado${lastGenerated > 1 ? 's' : ''}`
        : 'Nenhum lançamento novo'
    setGenerateMsg(msg)
    const timer = setTimeout(() => setGenerateMsg(null), 3000)
    return () => clearTimeout(timer)
  }, [lastGenerated])

  const handleGenerate = async () => {
    await generateRecurring(currentMonthKey)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formCategoryId || !formAmount) return
    setFormSubmitting(true)
    try {
      await createTransaction({
        type: formType,
        categoryId: formCategoryId,
        amountReais: formAmount,
        description: formDescription || undefined,
        date: formDate,
      })
      setFormAmount('')
      setFormDescription('')
      setFormDate(todayISO())
      setFormCategoryId(0)
      setShowForm(false)
    } catch {
      // error shown via store
    } finally {
      setFormSubmitting(false)
    }
  }

  const recurringTxs = transactions.filter((t) => isRecurring(t))
  const adHocTxs = transactions.filter((t) => !isRecurring(t))

  // Sort recurring: pending first, then by date
  const sortedRecurring = [...recurringTxs].sort((a, b) => {
    if (isPending(a) && !isPending(b)) return -1
    if (!isPending(a) && isPending(b)) return 1
    return a.date.localeCompare(b.date)
  })

  // Sort ad-hoc chronologically
  const sortedAdHoc = [...adHocTxs].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="text-lg font-semibold">Lançamentos</h1>
      </header>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Month selector */}
        <MonthSelector
          monthKey={currentMonthKey}
          onPrevious={goToPreviousMonth}
          onNext={goToNextMonth}
        />

        {/* Error */}
        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {/* Generate recurring button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => void handleGenerate()}
            className="bg-surface border border-border hover:border-accent-info text-text-secondary hover:text-accent-info text-sm rounded-lg px-4 py-2.5 transition-colors"
          >
            Gerar recorrentes
          </button>
          {generateMsg && (
            <span className="text-text-secondary text-sm">{generateMsg}</span>
          )}
        </div>

        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-10">Carregando...</div>
        ) : (
          <>
            {/* Recurring transactions */}
            {sortedRecurring.length > 0 && (
              <section>
                <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">Recorrentes</p>
                <div className="flex flex-col gap-2">
                  {sortedRecurring.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onConfirm={confirmRecurring}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Ad-hoc transactions */}
            {sortedAdHoc.length > 0 && (
              <section>
                <p className="text-text-secondary text-xs uppercase tracking-wide mb-2">Avulsos</p>
                <div className="flex flex-col gap-2">
                  {sortedAdHoc.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      onRemove={removeTransaction}
                    />
                  ))}
                </div>
              </section>
            )}

            {transactions.length === 0 && (
              <div className="text-text-secondary text-sm text-center py-10 border border-dashed border-border rounded-xl">
                Nenhum lançamento neste mês.
              </div>
            )}

            {/* New transaction form */}
            <section>
              <button
                onClick={() => setShowForm(!showForm)}
                className="w-full flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                <span>+ Novo lançamento</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={`transition-transform ${showForm ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showForm && (
                <form
                  onSubmit={(e) => void handleFormSubmit(e)}
                  className="mt-2 bg-surface border border-border rounded-lg p-4 flex flex-col gap-3"
                >
                  {/* Type radio */}
                  <div>
                    <p className="text-text-secondary text-xs mb-2">Tipo</p>
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="expense"
                          checked={formType === 'expense'}
                          onChange={() => setFormType('expense')}
                          className="accent-accent-negative"
                        />
                        <span className="text-sm text-text-primary">Despesa</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="type"
                          value="income"
                          checked={formType === 'income'}
                          onChange={() => setFormType('income')}
                          className="accent-accent"
                        />
                        <span className="text-sm text-text-primary">Receita</span>
                      </label>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="text-text-secondary text-xs block mb-1">Categoria</label>
                    <select
                      value={formCategoryId}
                      onChange={(e) => setFormCategoryId(Number(e.target.value))}
                      required
                      className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    >
                      <option value={0} disabled>Selecione...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="text-text-secondary text-xs block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="ex: 150.00"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      required
                      className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="text-text-secondary text-xs block mb-1">Descrição (opcional)</label>
                    <input
                      type="text"
                      placeholder="ex: Mercado"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="text-text-secondary text-xs block mb-1">Data</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting || !formCategoryId || !formAmount}
                    className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50 transition-opacity active:scale-95"
                  >
                    {formSubmitting ? 'Salvando...' : 'Adicionar lançamento'}
                  </button>
                </form>
              )}
            </section>
          </>
        )}
      </div>

      <FinanceNav />
    </div>
  )
}
