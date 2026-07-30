import type { IFixedRouteRepository } from '../../domain/fixedRoute/repository'
import { buildFixedRoute } from '../../domain/fixedRoute/factory'
import type { FixedRoute } from '../../domain/fixedRoute/model'
import type { UpdateFixedRouteDTO } from '@finly/shared-types'

interface FixedRouteFormValues {
  name: string
  distanceKm: string
}

export function makeListFixedRoutesService(repo: IFixedRouteRepository) {
  return {
    execute: (onlyActive?: boolean): Promise<FixedRoute[]> => repo.findAll(onlyActive),
  }
}

export function makeCreateFixedRouteService(repo: IFixedRouteRepository) {
  return {
    execute: async (values: FixedRouteFormValues): Promise<FixedRoute> => {
      const params = buildFixedRoute(values)
      return repo.create(params)
    },
  }
}

export function makeUpdateFixedRouteService(repo: IFixedRouteRepository) {
  return {
    execute: async (id: number, values: Partial<FixedRouteFormValues>): Promise<FixedRoute> => {
      const dto: UpdateFixedRouteDTO = {}
      if (values.name !== undefined) dto.name = values.name.trim()
      if (values.distanceKm !== undefined) {
        const meters = Math.round(parseFloat(values.distanceKm) * 1000)
        if (isNaN(meters) || meters <= 0) throw new Error('Distância inválida')
        dto.distanceMeters = meters
      }
      return repo.update(id, dto)
    },
  }
}

export function makeArchiveFixedRouteService(repo: IFixedRouteRepository) {
  return {
    execute: (id: number): Promise<void> => repo.archive(id),
  }
}
