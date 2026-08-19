import type { OptionPositionDTO } from '@finly/shared-types'
import type { OptionPosition } from './model'

/** Transforma um OptionPositionDTO vindo da API em entidade de domínio. */
export function hydrateOptionPosition(dto: OptionPositionDTO): OptionPosition {
  return {
    id: dto.id,
    underlyingAsset: dto.underlyingAsset,
    optionType: dto.optionType,
    strategyLabel: dto.strategyLabel,
    quantity: dto.quantity,
    premiumReceivedCents: dto.premiumReceivedCents,
    strikeCents: dto.strikeCents,
    breakevenCents: dto.breakevenCents,
    popBps: dto.popBps,
    expiryDate: dto.expiryDate,
    daysToExpiry: dto.daysToExpiry,
    isActive: dto.isActive,
    createdAt: dto.createdAt,
  }
}
