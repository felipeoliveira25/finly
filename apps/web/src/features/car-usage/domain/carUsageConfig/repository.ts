import type { CarUsageConfig } from './model'
import type { CreateCarUsageConfigDTO } from '@finly/shared-types'

export interface ICarUsageConfigRepository {
  findAll(): Promise<CarUsageConfig[]>
  findActive(date?: string): Promise<CarUsageConfig | null>   // null se nenhuma config cadastrada
  create(data: CreateCarUsageConfigDTO): Promise<CarUsageConfig>
}
