import type { ICarUsageConfigRepository } from '../../domain/carUsageConfig/repository'
import { buildCarUsageConfig } from '../../domain/carUsageConfig/factory'
import type { CarUsageConfig } from '../../domain/carUsageConfig/model'

interface CarUsageConfigFormValues {
  pricePerLiter: string
  avgConsumptionKmL: string
  effectiveFrom: string
}

export function makeListConfigsService(repo: ICarUsageConfigRepository) {
  return {
    execute: (): Promise<CarUsageConfig[]> => repo.findAll(),
  }
}

export function makeGetActiveConfigService(repo: ICarUsageConfigRepository) {
  return {
    execute: (date?: string): Promise<CarUsageConfig | null> => repo.findActive(date),
  }
}

export function makeCreateConfigService(repo: ICarUsageConfigRepository) {
  return {
    execute: async (values: CarUsageConfigFormValues): Promise<CarUsageConfig> => {
      const params = buildCarUsageConfig(values)
      return repo.create(params)
    },
  }
}
