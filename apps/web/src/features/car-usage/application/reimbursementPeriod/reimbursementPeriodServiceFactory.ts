import type { IReimbursementPeriodRepository } from '../../domain/reimbursementPeriod/repository'
import { buildReimbursementPeriod } from '../../domain/reimbursementPeriod/factory'
import type { ReimbursementPeriod, ReimbursementPeriodDetail } from '../../domain/reimbursementPeriod/model'

interface ReimbursementPeriodFormValues {
  label: string
  startDate: string
  endDate: string
}

export function makeListPeriodsService(repo: IReimbursementPeriodRepository) {
  return {
    execute: (): Promise<ReimbursementPeriod[]> => repo.findAll(),
  }
}

export function makeGetPeriodDetailService(repo: IReimbursementPeriodRepository) {
  return {
    execute: (id: number): Promise<ReimbursementPeriodDetail> => repo.findById(id),
  }
}

export function makeClosePeriodService(repo: IReimbursementPeriodRepository) {
  return {
    execute: async (values: ReimbursementPeriodFormValues): Promise<ReimbursementPeriod> => {
      const params = buildReimbursementPeriod(values)
      return repo.close(params)
    },
  }
}
