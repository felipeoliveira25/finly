import type {
  MonthlySummaryDTO,
  CategoryBreakdownDTO,
  PreviousMonthSummaryDTO,
} from '@finly/shared-types'
import type { MonthlySummary, CategoryBreakdown, PreviousMonthSummary } from './model'

function hydrateCategoryBreakdown(dto: CategoryBreakdownDTO): CategoryBreakdown {
  return { ...dto }
}

function hydratePreviousMonth(dto: PreviousMonthSummaryDTO): PreviousMonthSummary {
  return { ...dto }
}

/**
 * Transforma um MonthlySummaryDTO vindo da API em entidade de domínio.
 * Não valida — confia que a API já validou os dados.
 */
export function hydrateMonthlySummary(dto: MonthlySummaryDTO): MonthlySummary {
  return {
    ...dto,
    categoryBreakdown: dto.categoryBreakdown.map(hydrateCategoryBreakdown),
    previousMonth: dto.previousMonth ? hydratePreviousMonth(dto.previousMonth) : null,
  }
}
