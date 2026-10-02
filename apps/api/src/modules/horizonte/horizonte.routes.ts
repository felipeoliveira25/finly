import { Router } from 'express'
import * as controller from './horizonte.controller'

const router = Router()

router.get('/', controller.getExpenses)
router.post('/', controller.createExpense)
router.delete('/:id', controller.deleteExpense)
router.patch('/:id/paid', controller.updatePaid)

export default router
