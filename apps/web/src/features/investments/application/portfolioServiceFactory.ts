import type { IInvestmentsRepository } from '../domain/repository'
import type { StockPosition } from '../domain/stockPosition/model'
import type { TreasuryApplication } from '../domain/treasuryApplication/model'
import type { OptionPosition } from '../domain/optionPosition/model'
import type { PortfolioSnapshot } from '../domain/portfolioSnapshot/model'
import type { PortfolioDTO, CronRunDTO } from '@finly/shared-types'

export function makeGetPortfolioService(repo: IInvestmentsRepository) {
  return {
    execute: (): Promise<PortfolioDTO> => repo.getPortfolio(),
  }
}

export function makeGetSnapshotsService(repo: IInvestmentsRepository) {
  return {
    execute: (limit?: number): Promise<PortfolioSnapshot[]> => repo.getSnapshots(limit),
  }
}

export function makeGetStocksService(repo: IInvestmentsRepository) {
  return {
    execute: (): Promise<StockPosition[]> => repo.getStocks(),
  }
}

export function makeGetTreasuryService(repo: IInvestmentsRepository) {
  return {
    execute: (): Promise<TreasuryApplication[]> => repo.getTreasury(),
  }
}

export function makeGetOptionsService(repo: IInvestmentsRepository) {
  return {
    execute: (): Promise<OptionPosition[]> => repo.getOptions(),
  }
}

export function makeGetCronStatusService(repo: IInvestmentsRepository) {
  return {
    execute: (): Promise<CronRunDTO | null> => repo.getCronStatus(),
  }
}

export function makeTriggerSnapshotService(repo: IInvestmentsRepository) {
  return {
    execute: (): Promise<void> => repo.triggerSnapshot(),
  }
}
