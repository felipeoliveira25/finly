import { useState } from 'react'
import type { Transaction } from '../../../domain/transaction/model'
import { isPending, isRecurring } from '../../../domain/transaction/model'
import { formatCurrency, formatDate } from '../../utils/format'

interface TransactionItemProps {
  transaction: Transaction
  onConfirm?: (id: number, amountReais: string) => Promise<void>
  onRemove?: (id: number) => void
}

export function TransactionItem({ transaction: tx, onConfirm, onRemove }: TransactionItemProps) {
  const [showConfirmForm, setShowConfirmForm] = useState(false)
  const [confirmAmount, setConfirmAmount] = useState(
    (tx.amountCents / 100).toFixed(2),
  )
  const [confirming, setConfirming] = useState(false)

  const displayName = tx.recurringModelName ?? tx.categoryName

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!onConfirm) return
    setConfirming(true)
    try {
      await onConfirm(tx.id, confirmAmount)
      setShowConfirmForm(false)
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="bg-surface border border-border rounded-lg px-4 py-3">
      {isPending(tx) ? (
        /* ── Pending state ── */
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 text-xs font-medium border border-yellow-500/30 bg-yellow-500/10 rounded px-1.5 py-0.5">
                  Pendente
                </span>
                <span className="text-text-primary text-sm font-medium truncate">{displayName}</span>
              </div>
              <p className="text-text-secondary text-xs mt-0.5">{formatDate(tx.date)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-accent' : 'text-accent-negative'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amountCents)}
              </p>
            </div>
          </div>

          {!showConfirmForm ? (
            <button
              onClick={() => setShowConfirmForm(true)}
              className="self-start text-xs text-accent-info border border-accent-info/30 rounded px-3 py-1.5 hover:bg-accent-info/10 transition-colors"
            >
              Confirmar
            </button>
          ) : (
            <form onSubmit={(e) => void handleConfirmSubmit(e)} className="flex flex-col gap-2 mt-1">
              <div>
                <label className="text-text-secondary text-xs block mb-1">Valor confirmado (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={confirmAmount}
                  onChange={(e) => setConfirmAmount(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={confirming}
                  className="flex-1 bg-accent text-black font-medium text-sm rounded-lg py-2 disabled:opacity-50 transition-opacity"
                >
                  {confirming ? 'Confirmando...' : 'Confirmar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmForm(false)}
                  className="flex-1 bg-surface-elevated border border-border text-text-secondary text-sm rounded-lg py-2 hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        /* ── Confirmed state ── */
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              {isRecurring(tx) && (
                /* Lock-open icon for recurring confirmed */
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-secondary shrink-0"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                </svg>
              )}
              <span className="text-text-primary text-sm font-medium truncate">{displayName}</span>
            </div>
            {tx.description && (
              <p className="text-text-secondary text-xs mt-0.5 truncate">{tx.description}</p>
            )}
            <p className="text-text-secondary text-xs mt-0.5">{formatDate(tx.date)}</p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <p className={`text-sm font-semibold ${tx.type === 'income' ? 'text-accent' : 'text-accent-negative'}`}>
              {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amountCents)}
            </p>
            {!isRecurring(tx) && onRemove && (
              <button
                onClick={() => onRemove(tx.id)}
                className="text-text-secondary hover:text-accent-negative transition-colors p-1"
                aria-label="Remover lançamento"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
