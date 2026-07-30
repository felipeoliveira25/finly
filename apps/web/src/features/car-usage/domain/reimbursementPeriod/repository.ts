import type { ReimbursementPeriod, ReimbursementPeriodDetail } from './model'
import type { ClosePeriodDTO } from '@finly/shared-types'

export interface IReimbursementPeriodRepository {
  findAll(): Promise<ReimbursementPeriod[]>
  findById(id: number): Promise<ReimbursementPeriodDetail>
  close(data: ClosePeriodDTO): Promise<ReimbursementPeriod>
}
