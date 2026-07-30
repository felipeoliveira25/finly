import { useEffect, useState } from 'react'
import { useFinanceSettingsStore } from '../../state/store/useFinanceSettingsStore'
import { FinanceNav } from '../../components/FinanceNav/FinanceNav'
import { formatCurrency } from '../../utils/format'
import type { RecurringTransactionModel } from '../../../domain/recurringTransactionModel/model'
import type { Category } from '../../../domain/category/model'
import type { TransactionType } from '@finly/shared-types'

type Tab = 'models' | 'categories'

export function SettingsPage() {
  const {
    models,
    categories,
    isLoading,
    error,
    fetchData,
    createModel,
    archiveModel,
    createCategory,
    deleteCategory,
  } = useFinanceSettingsStore()

  const [tab, setTab] = useState<Tab>('models')

  // Model form state
  const [modelName, setModelName] = useState('')
  const [modelType, setModelType] = useState<TransactionType>('expense')
  const [modelCategoryId, setModelCategoryId] = useState<number>(0)
  const [modelAmount, setModelAmount] = useState('')
  const [modelDay, setModelDay] = useState('')
  const [modelSubmitting, setModelSubmitting] = useState(false)

  // Category form state
  const [categoryName, setCategoryName] = useState('')
  const [categorySubmitting, setCategorySubmitting] = useState(false)

  useEffect(() => {
    void fetchData()
  }, [])

  const tabClass = (t: Tab) =>
    `flex-1 py-2.5 text-sm font-medium transition-colors ${
      tab === t
        ? 'text-text-primary border-b-2 border-accent'
        : 'text-text-secondary border-b-2 border-transparent'
    }`

  const handleCreateModel = async (e: React.FormEvent) => {
    e.preventDefault()
    setModelSubmitting(true)
    try {
      await createModel({
        name: modelName,
        type: modelType,
        categoryId: modelCategoryId,
        defaultAmountReais: modelAmount,
        dayOfMonth: modelDay,
      })
      setModelName('')
      setModelType('expense')
      setModelCategoryId(0)
      setModelAmount('')
      setModelDay('')
    } catch {
      // error shown via store
    } finally {
      setModelSubmitting(false)
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategorySubmitting(true)
    try {
      await createCategory(categoryName)
      setCategoryName('')
    } catch {
      // error shown via store
    } finally {
      setCategorySubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24">
      <header className="sticky top-0 bg-background/95 backdrop-blur border-b border-border px-4 py-3 z-10">
        <h1 className="text-lg font-semibold">Configurações Financeiras</h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border px-4">
        <button className={tabClass('models')} onClick={() => setTab('models')}>
          Modelos
        </button>
        <button className={tabClass('categories')} onClick={() => setTab('categories')}>
          Categorias
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {error && (
          <div className="bg-accent-negative/10 border border-accent-negative/30 rounded-lg px-4 py-3 text-sm text-accent-negative">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="text-text-secondary text-sm text-center py-6">Carregando...</div>
        ) : tab === 'models' ? (
          <>
            {/* Models list */}
            {models.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6 border border-dashed border-border rounded-xl">
                Nenhum modelo recorrente cadastrado.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {models.map((model) => (
                  <ModelItem key={model.id} model={model} onArchive={archiveModel} />
                ))}
              </div>
            )}

            {/* Create model form */}
            <form
              onSubmit={(e) => void handleCreateModel(e)}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
            >
              <p className="text-text-secondary text-xs uppercase tracking-wide">Novo modelo</p>

              <div>
                <label className="text-text-secondary text-xs block mb-1">Nome</label>
                <input
                  type="text"
                  placeholder="ex: Aluguel"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <p className="text-text-secondary text-xs mb-2">Tipo</p>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modelType"
                      value="expense"
                      checked={modelType === 'expense'}
                      onChange={() => setModelType('expense')}
                      className="accent-accent-negative"
                    />
                    <span className="text-sm text-text-primary">Despesa</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="modelType"
                      value="income"
                      checked={modelType === 'income'}
                      onChange={() => setModelType('income')}
                      className="accent-accent"
                    />
                    <span className="text-sm text-text-primary">Receita</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-text-secondary text-xs block mb-1">Categoria</label>
                <select
                  value={modelCategoryId}
                  onChange={(e) => setModelCategoryId(Number(e.target.value))}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
                >
                  <option value={0} disabled>Selecione...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-text-secondary text-xs block mb-1">Valor padrão (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="ex: 1200.00"
                  value={modelAmount}
                  onChange={(e) => setModelAmount(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-text-secondary text-xs block mb-1">Dia do mês (1–31)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="ex: 5"
                  value={modelDay}
                  onChange={(e) => setModelDay(e.target.value)}
                  required
                  className="w-full bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <button
                type="submit"
                disabled={modelSubmitting}
                className="bg-accent text-black font-medium text-sm rounded-lg py-3 disabled:opacity-50"
              >
                {modelSubmitting ? 'Salvando...' : 'Adicionar modelo'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Categories list */}
            {categories.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-6 border border-dashed border-border rounded-xl">
                Nenhuma categoria cadastrada.
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <CategoryItem
                    key={cat.id}
                    category={cat}
                    onDelete={cat.isSystem ? undefined : deleteCategory}
                  />
                ))}
              </div>
            )}

            {/* Create category form */}
            <form
              onSubmit={(e) => void handleCreateCategory(e)}
              className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
            >
              <p className="text-text-secondary text-xs uppercase tracking-wide">Nova categoria</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: Transporte"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                  className="flex-1 bg-surface-elevated border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent"
                />
                <button
                  type="submit"
                  disabled={categorySubmitting || !categoryName}
                  className="bg-accent text-black font-medium text-sm rounded-lg px-4 py-2.5 disabled:opacity-50"
                >
                  {categorySubmitting ? '...' : 'Adicionar'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <FinanceNav />
    </div>
  )
}

function ModelItem({
  model,
  onArchive,
}: {
  model: RecurringTransactionModel
  onArchive: (id: number) => Promise<void>
}) {
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3 gap-2">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-text-primary text-sm font-medium truncate">{model.name}</span>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded border ${
              model.type === 'income'
                ? 'text-accent border-accent/30 bg-accent/10'
                : 'text-accent-negative border-accent-negative/30 bg-accent-negative/10'
            }`}
          >
            {model.type === 'income' ? 'Receita' : 'Despesa'}
          </span>
        </div>
        <p className="text-text-secondary text-xs mt-0.5">
          {model.categoryName} · {formatCurrency(model.defaultAmountCents)} · dia {model.dayOfMonth}
        </p>
      </div>
      <button
        onClick={() => void onArchive(model.id)}
        className="text-text-secondary hover:text-accent-negative transition-colors p-1 shrink-0"
        aria-label="Arquivar modelo"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    </div>
  )
}

function CategoryItem({
  category,
  onDelete,
}: {
  category: Category
  onDelete?: (id: number) => Promise<void>
}) {
  return (
    <div className="flex items-center justify-between bg-surface border border-border rounded-lg px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="text-text-primary text-sm">{category.name}</span>
        {category.isSystem && (
          <span className="text-xs text-text-secondary border border-border rounded px-1.5 py-0.5 bg-surface-elevated">
            Sistema
          </span>
        )}
      </div>
      {onDelete && (
        <button
          onClick={() => void onDelete(category.id)}
          className="text-text-secondary hover:text-accent-negative transition-colors p-1"
          aria-label="Remover categoria"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
          </svg>
        </button>
      )}
    </div>
  )
}
