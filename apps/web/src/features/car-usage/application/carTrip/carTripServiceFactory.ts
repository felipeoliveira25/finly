import type { ICarTripRepository } from '../../domain/carTrip/repository'
import { buildCarTrip } from '../../domain/carTrip/factory'
import type { CarTrip } from '../../domain/carTrip/model'
import type { CreateCarTripDTO } from '@finly/shared-types'

interface CarTripFormValues {
  date: string
  fixedRouteId?: number
  distanceKm: string
  description?: string
}

export function makeListCarTripsService(repo: ICarTripRepository) {
  return {
    execute: (filters?: { startDate?: string; endDate?: string }): Promise<CarTrip[]> =>
      repo.findAll(filters),
  }
}

export function makeRegisterCarTripService(repo: ICarTripRepository) {
  return {
    execute: async (values: CarTripFormValues): Promise<CarTrip> => {
      const params = buildCarTrip(values)
      const dto: CreateCarTripDTO = {
        date: params.date,
        fixedRouteId: params.fixedRouteId,
        distanceMeters: params.distanceMeters,
        description: params.description,
      }
      return repo.create(dto)
    },
  }
}

export function makeDeleteCarTripService(repo: ICarTripRepository) {
  return {
    execute: (id: number): Promise<void> => repo.remove(id),
  }
}
