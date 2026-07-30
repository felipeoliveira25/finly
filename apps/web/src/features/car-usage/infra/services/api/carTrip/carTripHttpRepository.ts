import { apiFetch } from '@/lib/api'
import type { CarTripDTO, CreateCarTripDTO } from '@finly/shared-types'
import { hydrateCarTrip } from '../../../../domain/carTrip/factory'
import type { ICarTripRepository } from '../../../../domain/carTrip/repository'

export function makeCarTripHttpRepository(): ICarTripRepository {
  return {
    findAll: async (filters) => {
      const params = new URLSearchParams()
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)
      const query = params.toString()
      const dtos = await apiFetch<CarTripDTO[]>(`/car-usage/trips${query ? `?${query}` : ''}`)
      return dtos.map(hydrateCarTrip)
    },
    create: async (data: CreateCarTripDTO) => {
      const dto = await apiFetch<CarTripDTO>('/car-usage/trips', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateCarTrip(dto)
    },
    remove: async (id: number) => {
      await apiFetch<void>(`/car-usage/trips/${id}`, { method: 'DELETE' })
    },
  }
}
