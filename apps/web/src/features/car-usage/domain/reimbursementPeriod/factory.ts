import type { ReimbursementPeriodDTO, CarTripDTO } from '@finly/shared-types'
import { hydrateCarTrip } from '../carTrip/factory'
import type { ReimbursementPeriod, ReimbursementPeriodDetail } from './model'

interface CreateReimbursementPeriodParams {
  label: string
  startDate: string   // 'YYYY-MM-DD'
  endDate: string     // 'YYYY-MM-DD'
}

interface ReimbursementPeriodFormValues {
  label: string
  startDate: string
  endDate: string
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Valida os parâmetros de criação de um período de reembolso.
 * Lança Error se label vazio, datas inválidas ou startDate > endDate.
 */
export function createReimbursementPeriod(
  params: CreateReimbursementPeriodParams,
): CreateReimbursementPeriodParams {
  if (params.label.trim() === '') {
    throw new Error('Label do período não pode ser vazio')
  }
  if (!DATE_REGEX.test(params.startDate)) {
    throw new Error('startDate deve estar no formato YYYY-MM-DD')
  }
  if (!DATE_REGEX.test(params.endDate)) {
    throw new Error('endDate deve estar no formato YYYY-MM-DD')
  }
  if (params.startDate > params.endDate) {
    throw new Error('startDate não pode ser posterior a endDate')
  }

  return params
}

/**
 * Transforma um ReimbursementPeriodDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateReimbursementPeriod(dto: ReimbursementPeriodDTO): ReimbursementPeriod {
  return {
    id: dto.id,
    label: dto.label,
    startDate: dto.startDate,
    endDate: dto.endDate,
    totalKmMeters: dto.totalKmMeters,
    totalCostCents: dto.totalCostCents,
    totalParkingCents: dto.totalParkingCents,
    totalFuelRefillCents: dto.totalFuelRefillCents,
    closedAt: dto.closedAt,
    createdAt: dto.createdAt,
  }
}

/**
 * Transforma um ReimbursementPeriodDTO com trips em ReimbursementPeriodDetail.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateReimbursementPeriodDetail(
  dto: ReimbursementPeriodDTO & { trips: CarTripDTO[] },
): ReimbursementPeriodDetail {
  return {
    ...hydrateReimbursementPeriod(dto),
    trips: dto.trips.map(hydrateCarTrip),
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateReimbursementPeriodParams validados.
 */
export function buildReimbursementPeriod(
  values: ReimbursementPeriodFormValues,
): CreateReimbursementPeriodParams {
  const params: CreateReimbursementPeriodParams = {
    label: values.label.trim(),
    startDate: values.startDate,
    endDate: values.endDate,
  }

  return createReimbursementPeriod(params)
}
