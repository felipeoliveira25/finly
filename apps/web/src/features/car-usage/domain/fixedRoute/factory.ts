import type { FixedRouteDTO } from '@finly/shared-types'
import type { FixedRoute } from './model'

interface CreateFixedRouteParams {
  name: string
  distanceMeters: number
}

interface FixedRouteFormValues {
  name: string
  distanceKm: string   // ex: "8" ou "12.5"
}

/**
 * Constrói os campos editáveis de uma FixedRoute a partir de input do usuário.
 * Valida as regras de negócio — lança Error se o estado for inválido.
 */
export function createFixedRoute(params: CreateFixedRouteParams): Pick<FixedRoute, 'name' | 'distanceMeters'> {
  if (params.name.trim() === '') {
    throw new Error('Nome da rota não pode ser vazio')
  }
  if (params.distanceMeters <= 0) {
    throw new Error('distanceMeters deve ser maior que zero')
  }

  return {
    name: params.name,
    distanceMeters: params.distanceMeters,
  }
}

/**
 * Transforma um FixedRouteDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateFixedRoute(dto: FixedRouteDTO): FixedRoute {
  return {
    id: dto.id,
    name: dto.name,
    distanceMeters: dto.distanceMeters,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateFixedRouteParams validados.
 * Converte distanceKm (string) para distanceMeters (integer arredondado).
 */
export function buildFixedRoute(values: FixedRouteFormValues): CreateFixedRouteParams {
  const km = parseFloat(values.distanceKm)
  if (isNaN(km)) {
    throw new Error('Distância inválida')
  }

  const params: CreateFixedRouteParams = {
    name: values.name,
    distanceMeters: Math.round(km * 1000),
  }

  createFixedRoute(params)

  return params
}
