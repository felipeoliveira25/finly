import { create } from 'zustand'
import { makeTransactionHttpRepository } from '../../../infra/services/api/transaction/transactionHttpRepository'
import { makeCategoryHttpRepository } from '../../../infra/services/api/category/categoryHttpRepository'
import {
  makeListTransactionsService,
  makeCreateTransactionService,
  makeConfirmRecurringService,
  makeDeleteTransactionService,
  makeGenerateRecurringService,
} from '../../../application/transaction/transactionServiceFactory'
import { makeListCategoriesService } from '../../../application/category/categoryServiceFactory'
import type { Transaction } from '../../../domain/transaction/model'
import type { Category } from '../../../domain/category/model'
import type { TransactionType } from '@finly/shared-types'

interface TransactionFormValues {
  type: TransactionType
  categoryId: number
  amountReais: string
  description?: string
  date: string
}

interface TransactionsState {
  transactions: Transaction[]
  categories: Category[]
  isLoading: boolean
  error: string | null
  lastGenerated: number | null
  fetchData: (monthKey: string) => Promise<void>
  generateRecurring: (monthKey: string) => Promise<void>
  createTransaction: (values: TransactionFormValues) => Promise<void>
  confirmRecurring: (id: number, amountReais: string) => Promise<void>
  removeTransaction: (id: number) => Promise<void>
}

export const useFinanceTransactionsStore = create<TransactionsState>((set, get) => ({
  transactions: [],
  categories: [],
  isLoading: false,
  error: null,
  lastGenerated: null,

  fetchData: async (monthKey) => {
    set({ isLoading: true, error: null })
    try {
      const txRepo = makeTransactionHttpRepository()
      const catRepo = makeCategoryHttpRepository()
      const [transactions, categories] = await Promise.all([
        makeListTransactionsService(txRepo).execute(monthKey),
        makeListCategoriesService(catRepo).execute(),
      ])
      set({ transactions, categories })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar lançamentos' })
    } finally {
      set({ isLoading: false })
    }
  },

  generateRecurring: async (monthKey) => {
    set({ error: null, lastGenerated: null })
    try {
      const repo = makeTransactionHttpRepository()
      const result = await makeGenerateRecurringService(repo).execute(monthKey)
      set({ lastGenerated: result.generated })
      await get().fetchData(monthKey)
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao gerar recorrentes' })
    }
  },

  createTransaction: async (values) => {
    set({ error: null })
    try {
      const repo = makeTransactionHttpRepository()
      const tx = await makeCreateTransactionService(repo).execute(values)
      set((state) => ({ transactions: [...state.transactions, tx] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao criar lançamento' })
      throw e
    }
  },

  confirmRecurring: async (id, amountReais) => {
    set({ error: null })
    try {
      const repo = makeTransactionHttpRepository()
      const updated = await makeConfirmRecurringService(repo).execute(id, { amountReais })
      set((state) => ({
        transactions: state.transactions.map((t) => (t.id === id ? updated : t)),
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao confirmar lançamento' })
      throw e
    }
  },

  removeTransaction: async (id) => {
    set({ error: null })
    try {
      const repo = makeTransactionHttpRepository()
      await makeDeleteTransactionService(repo).execute(id)
      set((state) => ({ transactions: state.transactions.filter((t) => t.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao remover lançamento' })
    }
  },
}))
