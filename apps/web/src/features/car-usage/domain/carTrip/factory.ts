import type { CarTripDTO } from '@finly/shared-types'
import type { CarTrip } from './model'

interface CreateCarTripParams {
  date: string
  fixedRouteId?: number
  distanceMeters: number    // já em metros
  description?: string
}

interface CarTripFormValues {
  date: string
  fixedRouteId?: number
  distanceKm: string        // texto do formulário, ex: "8.3"
  description?: string
}

/**
 * Constrói uma entidade CarTrip a partir de input do usuário.
 * Valida as regras de negócio — lança Error se o estado for inválido.
 * Os campos gerenciados pelo servidor (id, configId, costCents, createdAt) são zerados/nulos.
 */
export function createCarTrip(params: CreateCarTripParams): CarTrip {
  if (params.distanceMeters <= 0) {
    throw new Error('distanceMeters deve ser maior que zero')
  }

  return {
    id: 0,
    date: params.date,
    fixedRouteId: params.fixedRouteId ?? null,
    fixedRouteName: null,
    distanceMeters: params.distanceMeters,
    description: params.description ?? null,
    configId: 0,
    costCents: 0,
    periodId: null,
    createdAt: '',
  }
}

/**
 * Transforma um CarTripDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateCarTrip(dto: CarTripDTO): CarTrip {
  return {
    id: dto.id,
    date: dto.date,
    fixedRouteId: dto.fixedRouteId,
    fixedRouteName: dto.fixedRouteName,
    distanceMeters: dto.distanceMeters,
    description: dto.description,
    configId: dto.configId,
    costCents: dto.costCents,
    periodId: dto.periodId,
    createdAt: dto.createdAt,
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateCarTripParams validados.
 * Converte distanceKm (string) para distanceMeters (integer arredondado).
 */
export function buildCarTrip(values: CarTripFormValues): CreateCarTripParams {
  const km = parseFloat(values.distanceKm)
  if (isNaN(km)) {
    throw new Error('Distância inválida')
  }

  const params: CreateCarTripParams = {
    date: values.date,
    fixedRouteId: values.fixedRouteId,
    distanceMeters: Math.round(km * 1000),
    description: values.description,
  }

  createCarTrip(params)

  return params
}
