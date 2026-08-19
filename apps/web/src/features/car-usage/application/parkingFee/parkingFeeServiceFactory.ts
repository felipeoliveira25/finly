import type { IParkingFeeRepository } from '../../domain/parkingFee/repository'
import type { ParkingFee } from '../../domain/parkingFee/model'
import { buildParkingFee } from '../../domain/parkingFee/factory'

export function makeListParkingFeesService(repo: IParkingFeeRepository) {
  return {
    execute: (filters?: { startDate?: string; endDate?: string }): Promise<ParkingFee[]> =>
      repo.findAll(filters),
  }
}

export function makeAddParkingFeeService(repo: IParkingFeeRepository) {
  return {
    execute: async (values: {
      date: string
      amountR$: string
      description?: string
    }): Promise<ParkingFee> => {
      const params = buildParkingFee(values)
      return repo.create({
        date: params.date,
        amountCents: params.amountCents,
        description: params.description,
      })
    },
  }
}

export function makeDeleteParkingFeeService(repo: IParkingFeeRepository) {
  return {
    execute: (id: number): Promise<void> => repo.remove(id),
  }
}
