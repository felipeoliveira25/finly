import type { TreasuryApplicationDTO } from '@finly/shared-types'
import type { TreasuryApplication } from './model'

/** Transforma um TreasuryApplicationDTO vindo da API em entidade de domínio. */
export function hydrateTreasuryApplication(dto: TreasuryApplicationDTO): TreasuryApplication {
  return {
    id: dto.id,
    titleCode: dto.titleCode,
    maturityDate: dto.maturityDate,
    investmentAmountCents: dto.investmentAmountCents,
    contractedRateBps: dto.contractedRateBps,
    purchaseDate: dto.purchaseDate,
    estimatedValueCents: dto.estimatedValueCents,
    totalRedeemedCents: dto.totalRedeemedCents,
    createdAt: dto.createdAt,
  }
}
