import { apiFetch } from '@/lib/api'
import type { FuelRefillDTO, CreateFuelRefillDTO } from '@finly/shared-types'
import { hydrateFuelRefill } from '../../../../domain/fuelRefill/factory'
import type { IFuelRefillRepository } from '../../../../domain/fuelRefill/repository'

export function makeFuelRefillHttpRepository(): IFuelRefillRepository {
  return {
    findAll: async (filters) => {
      const params = new URLSearchParams()
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)
      const query = params.toString()
      const dtos = await apiFetch<FuelRefillDTO[]>(`/car-usage/fuel-refills${query ? `?${query}` : ''}`)
      return dtos.map(hydrateFuelRefill)
    },
    create: async (data: CreateFuelRefillDTO) => {
      const dto = await apiFetch<FuelRefillDTO>('/car-usage/fuel-refills', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateFuelRefill(dto)
    },
    remove: async (id: number) => {
      await apiFetch<void>(`/car-usage/fuel-refills/${id}`, { method: 'DELETE' })
    },
  }
}
