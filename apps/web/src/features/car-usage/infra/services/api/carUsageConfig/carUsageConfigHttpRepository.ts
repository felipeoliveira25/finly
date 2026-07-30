import { apiFetch } from '@/lib/api'
import type { CarUsageConfigDTO, CreateCarUsageConfigDTO } from '@finly/shared-types'
import { hydrateCarUsageConfig } from '../../../../domain/carUsageConfig/factory'
import type { ICarUsageConfigRepository } from '../../../../domain/carUsageConfig/repository'

export function makeCarUsageConfigHttpRepository(): ICarUsageConfigRepository {
  return {
    findAll: async () => {
      const dtos = await apiFetch<CarUsageConfigDTO[]>('/car-usage/configs')
      return dtos.map(hydrateCarUsageConfig)
    },
    findActive: async (date) => {
      const query = date ? `?date=${date}` : ''
      try {
        const dto = await apiFetch<CarUsageConfigDTO>(`/car-usage/configs/active${query}`)
        return hydrateCarUsageConfig(dto)
      } catch {
        return null // 404 → sem config cadastrada
      }
    },
    create: async (data: CreateCarUsageConfigDTO) => {
      const dto = await apiFetch<CarUsageConfigDTO>('/car-usage/configs', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateCarUsageConfig(dto)
    },
  }
}
