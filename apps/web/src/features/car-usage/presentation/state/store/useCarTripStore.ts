import { create } from 'zustand'
import { makeCarTripHttpRepository } from '../../../infra/services/api/carTrip/carTripHttpRepository'
import { makeFixedRouteHttpRepository } from '../../../infra/services/api/fixedRoute/fixedRouteHttpRepository'
import {
  makeListCarTripsService,
  makeRegisterCarTripService,
  makeDeleteCarTripService,
} from '../../../application/carTrip/carTripServiceFactory'
import { makeListFixedRoutesService } from '../../../application/fixedRoute/fixedRouteServiceFactory'
import type { CarTrip } from '../../../domain/carTrip/model'
import type { FixedRoute } from '../../../domain/fixedRoute/model'
import { todayISO } from '../../utils/format'

interface CarTripState {
  trips: CarTrip[]
  fixedRoutes: FixedRoute[]
  selectedDate: string
  isLoading: boolean
  error: string | null
  setSelectedDate: (date: string) => void
  fetchData: () => Promise<void>
  registerFixedRouteTrip: (fixedRoute: FixedRoute) => Promise<void>
  registerAdHocTrip: (distanceKm: string, description?: string) => Promise<void>
  removeTrip: (id: number) => Promise<void>
}

export const useCarTripStore = create<CarTripState>((set, get) => ({
  trips: [],
  fixedRoutes: [],
  selectedDate: todayISO(),
  isLoading: false,
  error: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date })
    get().fetchData()
  },

  fetchData: async () => {
    set({ isLoading: true, error: null })
    try {
      const tripRepo = makeCarTripHttpRepository()
      const routeRepo = makeFixedRouteHttpRepository()
      const [trips, fixedRoutes] = await Promise.all([
        makeListCarTripsService(tripRepo).execute({ startDate: get().selectedDate, endDate: get().selectedDate }),
        makeListFixedRoutesService(routeRepo).execute(true),
      ])
      set({ trips, fixedRoutes })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao carregar dados' })
    } finally {
      set({ isLoading: false })
    }
  },

  registerFixedRouteTrip: async (fixedRoute) => {
    set({ error: null })
    try {
      const repo = makeCarTripHttpRepository()
      const service = makeRegisterCarTripService(repo)
      const trip = await service.execute({
        date: get().selectedDate,
        fixedRouteId: fixedRoute.id,
        distanceKm: String(fixedRoute.distanceMeters / 1000),
      })
      set((state) => ({ trips: [...state.trips, trip] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao registrar trajeto' })
    }
  },

  registerAdHocTrip: async (distanceKm, description) => {
    set({ error: null })
    try {
      const repo = makeCarTripHttpRepository()
      const service = makeRegisterCarTripService(repo)
      const trip = await service.execute({
        date: get().selectedDate,
        distanceKm,
        description,
      })
      set((state) => ({ trips: [...state.trips, trip] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao registrar trajeto' })
    }
  },

  removeTrip: async (id) => {
    set({ error: null })
    try {
      const repo = makeCarTripHttpRepository()
      await makeDeleteCarTripService(repo).execute(id)
      set((state) => ({ trips: state.trips.filter((t) => t.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao remover trajeto' })
    }
  },
}))
