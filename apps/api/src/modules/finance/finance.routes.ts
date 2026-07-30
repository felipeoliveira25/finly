import { Router } from 'express'
import * as controller from './finance.controller'

const router = Router()

// Categories
router.get('/categories', controller.getCategories)
router.post('/categories', controller.createCategory)
router.delete('/categories/:id', controller.deleteCategory)

// Recurring Models
router.get('/recurring-models', controller.getModels)
router.post('/recurring-models', controller.createModel)
router.put('/recurring-models/:id', controller.updateModel)
router.delete('/recurring-models/:id', controller.archiveModel)

// Transactions — specific routes before parameterized ones
router.post('/transactions/generate/:monthKey', controller.generateRecurring)
router.get('/transactions', controller.getTransactions)
router.post('/transactions', controller.createTransaction)
router.put('/transactions/:id', controller.updateTransaction)
router.delete('/transactions/:id', controller.deleteTransaction)

// Summary
router.get('/summary/:monthKey', controller.getMonthlySummary)

export default router
