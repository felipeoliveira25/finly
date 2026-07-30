import type { FixedRoute } from './model'
import type { CreateFixedRouteDTO, UpdateFixedRouteDTO } from '@finly/shared-types'

export interface IFixedRouteRepository {
  findAll(onlyActive?: boolean): Promise<FixedRoute[]>
  create(data: CreateFixedRouteDTO): Promise<FixedRoute>
  update(id: number, data: UpdateFixedRouteDTO): Promise<FixedRoute>
  archive(id: number): Promise<void>
}
