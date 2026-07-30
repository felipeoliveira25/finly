import { apiFetch } from '@/lib/api'
import type { FixedRouteDTO, CreateFixedRouteDTO, UpdateFixedRouteDTO } from '@finly/shared-types'
import { hydrateFixedRoute } from '../../../../domain/fixedRoute/factory'
import type { IFixedRouteRepository } from '../../../../domain/fixedRoute/repository'

export function makeFixedRouteHttpRepository(): IFixedRouteRepository {
  return {
    findAll: async (onlyActive) => {
      const query = onlyActive ? '?onlyActive=true' : ''
      const dtos = await apiFetch<FixedRouteDTO[]>(`/car-usage/fixed-routes${query}`)
      return dtos.map(hydrateFixedRoute)
    },
    create: async (data: CreateFixedRouteDTO) => {
      const dto = await apiFetch<FixedRouteDTO>('/car-usage/fixed-routes', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateFixedRoute(dto)
    },
    update: async (id, data: UpdateFixedRouteDTO) => {
      const dto = await apiFetch<FixedRouteDTO>(`/car-usage/fixed-routes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
      return hydrateFixedRoute(dto)
    },
    archive: async (id) => {
      await apiFetch<void>(`/car-usage/fixed-routes/${id}`, { method: 'DELETE' })
    },
  }
}
