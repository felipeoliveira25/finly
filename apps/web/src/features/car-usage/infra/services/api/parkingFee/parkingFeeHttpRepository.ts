import { apiFetch } from '@/lib/api'
import type { ParkingFeeDTO, CreateParkingFeeDTO } from '@finly/shared-types'
import { hydrateParkingFee } from '../../../../domain/parkingFee/factory'
import type { IParkingFeeRepository } from '../../../../domain/parkingFee/repository'

export function makeParkingFeeHttpRepository(): IParkingFeeRepository {
  return {
    findAll: async (filters) => {
      const params = new URLSearchParams()
      if (filters?.startDate) params.set('startDate', filters.startDate)
      if (filters?.endDate) params.set('endDate', filters.endDate)
      const query = params.toString()
      const dtos = await apiFetch<ParkingFeeDTO[]>(`/car-usage/parking-fees${query ? `?${query}` : ''}`)
      return dtos.map(hydrateParkingFee)
    },
    create: async (data: CreateParkingFeeDTO) => {
      const dto = await apiFetch<ParkingFeeDTO>('/car-usage/parking-fees', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateParkingFee(dto)
    },
    remove: async (id: number) => {
      await apiFetch<void>(`/car-usage/parking-fees/${id}`, { method: 'DELETE' })
    },
  }
}
