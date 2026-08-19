import type { CreateParkingFeeDTO } from '@finly/shared-types'
import type { ParkingFee } from './model'

export interface IParkingFeeRepository {
  findAll(filters?: { startDate?: string; endDate?: string }): Promise<ParkingFee[]>
  create(data: CreateParkingFeeDTO): Promise<ParkingFee>
  remove(id: number): Promise<void>
}
