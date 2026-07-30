import type { CarTrip } from './model'
import type { CreateCarTripDTO } from '@finly/shared-types'

export interface ICarTripRepository {
  findAll(filters?: { startDate?: string; endDate?: string }): Promise<CarTrip[]>
  create(data: CreateCarTripDTO): Promise<CarTrip>
  remove(id: number): Promise<void>
}
