import { create } from 'zustand'
import { makeCarTripHttpRepository } from '../../../infra/services/api/carTrip/carTripHttpRepository'
import { makeFixedRouteHttpRepository } from '../../../infra/services/api/fixedRoute/fixedRouteHttpRepository'
import { makeParkingFeeHttpRepository } from '../../../infra/services/api/parkingFee/parkingFeeHttpRepository'
import { makeFuelRefillHttpRepository } from '../../../infra/services/api/fuelRefill/fuelRefillHttpRepository'
import {
  makeListCarTripsService,
  makeRegisterCarTripService,
  makeDeleteCarTripService,
} from '../../../application/carTrip/carTripServiceFactory'
import { makeListFixedRoutesService } from '../../../application/fixedRoute/fixedRouteServiceFactory'
import {
  makeAddParkingFeeService,
  makeDeleteParkingFeeService,
} from '../../../application/parkingFee/parkingFeeServiceFactory'
import {
  makeAddFuelRefillService,
  makeDeleteFuelRefillService,
} from '../../../application/fuelRefill/fuelRefillServiceFactory'
import type { CarTrip } from '../../../domain/carTrip/model'
import type { FixedRoute } from '../../../domain/fixedRoute/model'
import type { ParkingFee } from '../../../domain/parkingFee/model'
import type { FuelRefill } from '../../../domain/fuelRefill/model'
import { todayISO } from '../../utils/format'

interface CarTripState {
  trips: CarTrip[]
  fixedRoutes: FixedRoute[]
  parkingFees: ParkingFee[]
  fuelRefills: FuelRefill[]
  selectedDate: string
  isLoading: boolean
  error: string | null
  setSelectedDate: (date: string) => void
  fetchData: () => Promise<void>
  registerFixedRouteTrip: (fixedRoute: FixedRoute) => Promise<void>
  registerAdHocTrip: (distanceKm: string, description?: string) => Promise<void>
  removeTrip: (id: number) => Promise<void>
  addParkingFee: (amountR$: string, description?: string) => Promise<void>
  removeParkingFee: (id: number) => Promise<void>
  addFuelRefill: (amountR$: string, description?: string) => Promise<void>
  removeFuelRefill: (id: number) => Promise<void>
}

export const useCarTripStore = create<CarTripState>((set, get) => ({
  trips: [],
  fixedRoutes: [],
  parkingFees: [],
  fuelRefills: [],
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
      const parkingRepo = makeParkingFeeHttpRepository()
      const fuelRepo = makeFuelRefillHttpRepository()
      const date = get().selectedDate
      const [trips, fixedRoutes, parkingFees, fuelRefills] = await Promise.all([
        makeListCarTripsService(tripRepo).execute({ startDate: date, endDate: date }),
        makeListFixedRoutesService(routeRepo).execute(true),
        parkingRepo.findAll({ startDate: date, endDate: date }),
        fuelRepo.findAll({ startDate: date, endDate: date }),
      ])
      set({ trips, fixedRoutes, parkingFees, fuelRefills })
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

  addParkingFee: async (amountR$, description) => {
    set({ error: null })
    try {
      const repo = makeParkingFeeHttpRepository()
      const fee = await makeAddParkingFeeService(repo).execute({
        date: get().selectedDate,
        'amountR$': amountR$,
        description,
      })
      set((state) => ({ parkingFees: [...state.parkingFees, fee] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao registrar estacionamento' })
    }
  },

  removeParkingFee: async (id) => {
    set({ error: null })
    try {
      const repo = makeParkingFeeHttpRepository()
      await makeDeleteParkingFeeService(repo).execute(id)
      set((state) => ({ parkingFees: state.parkingFees.filter((f) => f.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao remover estacionamento' })
    }
  },

  addFuelRefill: async (amountR$, description) => {
    set({ error: null })
    try {
      const repo = makeFuelRefillHttpRepository()
      const refill = await makeAddFuelRefillService(repo).execute({
        date: get().selectedDate,
        'amountR$': amountR$,
        description,
      })
      set((state) => ({ fuelRefills: [...state.fuelRefills, refill] }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao registrar abastecimento' })
    }
  },

  removeFuelRefill: async (id) => {
    set({ error: null })
    try {
      const repo = makeFuelRefillHttpRepository()
      await makeDeleteFuelRefillService(repo).execute(id)
      set((state) => ({ fuelRefills: state.fuelRefills.filter((r) => r.id !== id) }))
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Erro ao remover abastecimento' })
    }
  },
}))
