import type { CreateFuelRefillDTO } from '@finly/shared-types'
import type { FuelRefill } from './model'

export interface IFuelRefillRepository {
  findAll(filters?: { startDate?: string; endDate?: string }): Promise<FuelRefill[]>
  create(data: CreateFuelRefillDTO): Promise<FuelRefill>
  remove(id: number): Promise<void>
}
