import { apiFetch } from '@/lib/api'
import type { ReimbursementPeriodDTO, ClosePeriodDTO, CarTripDTO } from '@finly/shared-types'
import {
  hydrateReimbursementPeriod,
  hydrateReimbursementPeriodDetail,
} from '../../../../domain/reimbursementPeriod/factory'
import type { IReimbursementPeriodRepository } from '../../../../domain/reimbursementPeriod/repository'

export function makeReimbursementPeriodHttpRepository(): IReimbursementPeriodRepository {
  return {
    findAll: async () => {
      const dtos = await apiFetch<ReimbursementPeriodDTO[]>('/car-usage/periods')
      return dtos.map(hydrateReimbursementPeriod)
    },
    findById: async (id: number) => {
      const dto = await apiFetch<ReimbursementPeriodDTO & { trips: CarTripDTO[] }>(
        `/car-usage/periods/${id}`,
      )
      return hydrateReimbursementPeriodDetail(dto)
    },
    close: async (data: ClosePeriodDTO) => {
      const dto = await apiFetch<ReimbursementPeriodDTO>('/car-usage/periods', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      return hydrateReimbursementPeriod(dto)
    },
  }
}
