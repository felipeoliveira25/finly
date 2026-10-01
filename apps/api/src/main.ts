import express from 'express'
import type { HealthCheckResponse } from '@finly/shared-types'
import { runMigrations } from './db/migrate'
import { runInvestmentsSeed } from './db/seeds/investmentsSeed'
import { registerJobs } from './jobs'
import carUsageRouter from './modules/car-usage/car-usage.routes'
import financeRouter from './modules/finance/finance.routes'
import investmentsRouter from './modules/investments/investments.routes'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(express.json())

const CORS_ORIGIN = process.env.CORS_ORIGIN ?? 'http://localhost:5173'

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', CORS_ORIGIN)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (_req.method === 'OPTIONS') { res.sendStatus(204); return }
  next()
})

app.use('/car-usage', carUsageRouter)
app.use('/finance', financeRouter)
app.use('/investments', investmentsRouter)

app.get('/health', (_req, res) => {
  const body: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '0.0.1',
  }
  res.json(body)
})

runMigrations()
  .then(async () => {
    await runInvestmentsSeed()
    registerJobs()
    app.listen(PORT, () => {
      console.log(`[api] Server running on http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('[db] Migration failed:', err)
    process.exit(1)
  })
