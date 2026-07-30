import { create } from 'zustand'
import { makeRecurringTransactionModelHttpRepository } from '../../../infra/services/api/recurringTransactionModel/recurringTransactionModelHttpRepository'
import { makeCategoryHttpRepository } from '../../../infra/services/api/category/categoryHttpRepository'
import {
  makeListModelsService,
  makeCreateModelService,
  makeArchiveModelService,
} from '../../../application/recurringTransactionModel/recurringTransactionModelServiceFactory'
import {
  makeListCategoriesService,
  makeCreateCategoryService,
  makeDeleteCategoryService,
} from '../../../application/category/categoryServiceFactory'
import type { RecurringTransactionModel } from '../../../domain/recurringTransactionModel/model'
import type { Category } from '../../../domain/category/model'
import type { TransactionType } from '@finly/shared-types'

interface ModelFormValues {
  name: string
  type: TransactionType
  categoryId: number
  defaultAmountReais: string
  dayOfMonth: string
}

interface SettingsState {
  models: RecurringTransactionModel[]
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchData: () => Promise<void>
  createModel: (values: ModelFormValues) => Promise<void>
  archiveModel: (id: number) => Promise<void>
  createCategory: (name: string) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
}

export const useFinanceSettingsStore = create<SettingsState>((set) => ({
  models: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const modelRepo = makeRecurringTransactionModelHttpRepository()
      const catRepo = makeCategoryHttpRepository()
      const [models, categories] = await Promise.all([
        makeListModelsService(modelRepo).execute(),
        makeListCategoriesService(catRepo).execute(),
      ])
      set({ models, categories })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar configurações' })
    } finally {
      set({ isLoading: false })
    }
  },

  createModel: async (values) => {
    set({ error: null })
    try {
      const repo = makeRecurringTransactionModelHttpRepository()
      const model = await makeCreateModelService(repo).execute(values)
      set((state) => ({ models: [...state.models, model] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao criar modelo' })
      throw e
    }
  },

  archiveModel: async (id) => {
    set({ error: null })
    try {
      const repo = makeRecurringTransactionModelHttpRepository()
      await makeArchiveModelService(repo).execute(id)
      set((state) => ({ models: state.models.filter((m) => m.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao arquivar modelo' })
    }
  },

  createCategory: async (name) => {
    set({ error: null })
    try {
      const repo = makeCategoryHttpRepository()
      const cat = await makeCreateCategoryService(repo).execute({ name })
      set((state) => ({ categories: [...state.categories, cat] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao criar categoria' })
      throw e
    }
  },

  deleteCategory: async (id) => {
    set({ error: null })
    try {
      const repo = makeCategoryHttpRepository()
      await makeDeleteCategoryService(repo).execute(id)
      set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao remover categoria' })
    }
  },
}))
