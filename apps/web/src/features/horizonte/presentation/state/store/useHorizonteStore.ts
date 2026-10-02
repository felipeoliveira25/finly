import { create } from 'zustand'
import { makeTripExpenseHttpRepository } from '../../../infra/services/api/tripExpense/tripExpenseHttpRepository'
import {
  makeListTripExpensesService,
  makeCreateTripExpenseService,
  makeUpdatePaidService,
  makeRemoveTripExpenseService,
} from '../../../application/tripExpenseServiceFactory'
import type { TripExpense } from '../../../domain/tripExpense/model'

interface HorizonteState {
  expenses: TripExpense[]
  loading: boolean
  error: string | null
  fetchExpenses: () => Promise<void>
  addExpense: (form: {
    desc: string
    cat: string
    valorReais: string
    data: string
    parcelas: string
  }) => Promise<void>
  togglePaid: (id: number, parcelaIndex: number, currentPaid: boolean) => Promise<void>
  removeExpense: (id: number) => Promise<void>
}

export const useHorizonteStore = create<HorizonteState>((set) => ({
  expenses: [],
  loading: false,
  error: null,

  fetchExpenses: async () => {
    set({ loading: true, error: null })
    try {
      const repo = makeTripExpenseHttpRepository()
      const expenses = await makeListTripExpensesService(repo).execute()
      set({ expenses })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar gastos' })
    } finally {
      set({ loading: false })
    }
  },

  addExpense: async (form) => {
    set({ error: null })
    try {
      const repo = makeTripExpenseHttpRepository()
      const expense = await makeCreateTripExpenseService(repo).execute(form)
      set((state) => ({ expenses: [...state.expenses, expense] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao adicionar gasto' })
      throw e
    }
  },

  togglePaid: async (id, parcelaIndex, currentPaid) => {
    set({ error: null })
    try {
      const repo = makeTripExpenseHttpRepository()
      const updated = await makeUpdatePaidService(repo).execute(id, parcelaIndex, !currentPaid)
      set((state) => ({
        expenses: state.expenses.map((e) => (e.id === id ? updated : e)),
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao atualizar parcela' })
    }
  },

  removeExpense: async (id) => {
    set({ error: null })
    try {
      const repo = makeTripExpenseHttpRepository()
      await makeRemoveTripExpenseService(repo).execute(id)
      set((state) => ({ expenses: state.expenses.filter((e) => e.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao remover gasto' })
    }
  },
}))
