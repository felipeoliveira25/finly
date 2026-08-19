import type { PortfolioSnapshotDTO } from '@finly/shared-types'
import type { PortfolioSnapshot } from './model'

/** Transforma um PortfolioSnapshotDTO vindo da API em entidade de domínio. */
export function hydratePortfolioSnapshot(dto: PortfolioSnapshotDTO): PortfolioSnapshot {
  return {
    id: dto.id,
    snapshotDate: dto.snapshotDate,
    stocksValueCents: dto.stocksValueCents,
    treasuryValueCents: dto.treasuryValueCents,
    totalValueCents: dto.totalValueCents,
    dataSource: dto.dataSource,
    createdAt: dto.createdAt,
  }
}
