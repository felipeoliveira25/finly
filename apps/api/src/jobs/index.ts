import cron from 'node-cron'
import { runPortfolioSnapshotJob } from './portfolioSnapshot.job'

export function registerJobs(): void {
  cron.schedule('0 21 * * *', () => {
    void runPortfolioSnapshotJob()
  })
  console.log('[cron] portfolio-snapshot agendado para 18h BRT (21h UTC)')
}
