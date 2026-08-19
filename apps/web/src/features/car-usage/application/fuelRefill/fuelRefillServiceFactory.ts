import type { IFuelRefillRepository } from '../../domain/fuelRefill/repository'
import type { FuelRefill } from '../../domain/fuelRefill/model'
import { buildFuelRefill } from '../../domain/fuelRefill/factory'

export function makeListFuelRefillsService(repo: IFuelRefillRepository) {
  return {
    execute: (filters?: { startDate?: string; endDate?: string }): Promise<FuelRefill[]> =>
      repo.findAll(filters),
  }
}

export function makeAddFuelRefillService(repo: IFuelRefillRepository) {
  return {
    execute: async (values: {
      date: string
      amountR$: string
      description?: string
    }): Promise<FuelRefill> => {
      const params = buildFuelRefill(values)
      return repo.create({
        date: params.date,
        amountCents: params.amountCents,
        description: params.description,
      })
    },
  }
}

export function makeDeleteFuelRefillService(repo: IFuelRefillRepository) {
  return {
    execute: (id: number): Promise<void> => repo.remove(id),
  }
}
