import { create } from 'zustand'
import { makeFixedRouteHttpRepository } from '../../../infra/services/api/fixedRoute/fixedRouteHttpRepository'
import { makeCarUsageConfigHttpRepository } from '../../../infra/services/api/carUsageConfig/carUsageConfigHttpRepository'
import {
  makeListFixedRoutesService,
  makeCreateFixedRouteService,
  makeUpdateFixedRouteService,
  makeArchiveFixedRouteService,
} from '../../../application/fixedRoute/fixedRouteServiceFactory'
import {
  makeListConfigsService,
  makeCreateConfigService,
} from '../../../application/carUsageConfig/carUsageConfigServiceFactory'
import type { FixedRoute } from '../../../domain/fixedRoute/model'
import type { CarUsageConfig } from '../../../domain/carUsageConfig/model'

interface SettingsState {
  fixedRoutes: FixedRoute[]
  configs: CarUsageConfig[]
  isLoading: boolean
  error: string | null
  fetchData: () => Promise<void>
  createFixedRoute: (values: { name: string; distanceKm: string }) => Promise<void>
  updateFixedRoute: (id: number, values: { name?: string; distanceKm?: string }) => Promise<void>
  archiveFixedRoute: (id: number) => Promise<void>
  createConfig: (values: { pricePerLiter: string; avgConsumptionKmL: string; effectiveFrom: string }) => Promise<void>
}

export const useCarUsageSettingsStore = create<SettingsState>((set) => ({
  fixedRoutes: [],
  configs: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const routeRepo = makeFixedRouteHttpRepository()
      const configRepo = makeCarUsageConfigHttpRepository()
      const [fixedRoutes, configs] = await Promise.all([
        makeListFixedRoutesService(routeRepo).execute(),
        makeListConfigsService(configRepo).execute(),
      ])
      set({ fixedRoutes, configs })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar configurações' })
    } finally {
      set({ isLoading: false })
    }
  },

  createFixedRoute: async (values) => {
    set({ error: null })
    try {
      const repo = makeFixedRouteHttpRepository()
      const route = await makeCreateFixedRouteService(repo).execute(values)
      set((state) => ({ fixedRoutes: [...state.fixedRoutes, route] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao criar trajeto' })
      throw e
    }
  },

  updateFixedRoute: async (id, values) => {
    set({ error: null })
    try {
      const repo = makeFixedRouteHttpRepository()
      const updated = await makeUpdateFixedRouteService(repo).execute(id, values)
      set((state) => ({
        fixedRoutes: state.fixedRoutes.map((r) => (r.id === id ? updated : r)),
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao atualizar trajeto' })
      throw e
    }
  },

  archiveFixedRoute: async (id) => {
    set({ error: null })
    try {
      const repo = makeFixedRouteHttpRepository()
      await makeArchiveFixedRouteService(repo).execute(id)
      set((state) => ({
        fixedRoutes: state.fixedRoutes.filter((r) => r.id !== id),
      }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao arquivar trajeto' })
      throw e
    }
  },

  createConfig: async (values) => {
    set({ error: null })
    try {
      const repo = makeCarUsageConfigHttpRepository()
      const config = await makeCreateConfigService(repo).execute(values)
      set((state) => ({ configs: [config, ...state.configs] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao salvar configuração' })
      throw e
    }
  },
}))
