import type { CarUsageConfigDTO } from '@finly/shared-types'
import type { CarUsageConfig } from './model'

interface CreateCarUsageConfigParams {
  pricePerLiterCents: number
  avgConsumptionCdkm: number
  effectiveFrom: string
}

interface CarUsageConfigFormValues {
  pricePerLiter: string       // ex: "6.29" → 629 centavos
  avgConsumptionKmL: string   // ex: "12.5" → 1250 cdkm
  effectiveFrom: string       // 'YYYY-MM-DD'
}

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Constrói os campos editáveis de uma CarUsageConfig a partir de input do usuário.
 * Valida as regras de negócio — lança Error se o estado for inválido.
 */
export function createCarUsageConfig(
  params: CreateCarUsageConfigParams,
): Pick<CarUsageConfig, 'pricePerLiterCents' | 'avgConsumptionCdkm' | 'effectiveFrom'> {
  if (params.pricePerLiterCents <= 0) {
    throw new Error('Preço por litro deve ser maior que zero')
  }
  if (params.avgConsumptionCdkm <= 0) {
    throw new Error('Consumo médio deve ser maior que zero')
  }
  if (!DATE_REGEX.test(params.effectiveFrom)) {
    throw new Error('effectiveFrom deve estar no formato YYYY-MM-DD')
  }

  return {
    pricePerLiterCents: params.pricePerLiterCents,
    avgConsumptionCdkm: params.avgConsumptionCdkm,
    effectiveFrom: params.effectiveFrom,
  }
}

/**
 * Transforma um CarUsageConfigDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateCarUsageConfig(dto: CarUsageConfigDTO): CarUsageConfig {
  return {
    id: dto.id,
    pricePerLiterCents: dto.pricePerLiterCents,
    avgConsumptionCdkm: dto.avgConsumptionCdkm,
    effectiveFrom: dto.effectiveFrom,
    createdAt: dto.createdAt,
  }
}

/**
 * Normaliza os valores brutos do formulário e retorna os CreateCarUsageConfigParams validados.
 * Converte pricePerLiter e avgConsumptionKmL (strings) para inteiros em centavos/cdkm.
 */
export function buildCarUsageConfig(values: CarUsageConfigFormValues): CreateCarUsageConfigParams {
  const price = parseFloat(values.pricePerLiter)
  if (isNaN(price)) {
    throw new Error('Preço inválido')
  }

  const consumption = parseFloat(values.avgConsumptionKmL)
  if (isNaN(consumption)) {
    throw new Error('Consumo inválido')
  }

  const params: CreateCarUsageConfigParams = {
    pricePerLiterCents: Math.round(price * 100),
    avgConsumptionCdkm: Math.round(consumption * 100),
    effectiveFrom: values.effectiveFrom,
  }

  createCarUsageConfig(params)

  return params
}
