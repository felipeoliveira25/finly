import type { StockPositionDTO } from '@finly/shared-types'
import type { StockPosition } from './model'

/** Transforma um StockPositionDTO vindo da API em entidade de domínio. */
export function hydrateStockPosition(dto: StockPositionDTO): StockPosition {
  return {
    id: dto.id,
    ticker: dto.ticker,
    quantity: dto.quantity,
    avgPriceCents: dto.avgPriceCents,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}
