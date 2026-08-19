import { Router } from 'express'
import * as controller from './investments.controller'

const router = Router()

router.get('/portfolio', controller.getPortfolio)
router.get('/snapshots', controller.getSnapshots)
router.get('/stocks', controller.getStocks)
router.get('/treasury', controller.getTreasury)
router.get('/options', controller.getOptions)
router.get('/cron-status', controller.getCronStatus)
router.post('/trigger-snapshot', controller.triggerSnapshot)

export default router
