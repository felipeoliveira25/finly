import { Router } from 'express'
import * as controller from './car-usage.controller'

const router = Router()

// Configs
router.get('/configs', controller.getConfigs)
router.post('/configs', controller.createConfig)
router.get('/configs/active', controller.getActiveConfig)

// Fixed routes
router.get('/fixed-routes', controller.getFixedRoutes)
router.post('/fixed-routes', controller.createFixedRoute)
router.put('/fixed-routes/:id', controller.updateFixedRoute)
router.delete('/fixed-routes/:id', controller.archiveFixedRoute)

// Trips
router.get('/trips', controller.getTrips)
router.post('/trips', controller.createTrip)
router.delete('/trips/:id', controller.deleteTrip)

// Parking fees
router.get('/parking-fees', controller.getParkingFees)
router.post('/parking-fees', controller.createParkingFee)
router.delete('/parking-fees/:id', controller.deleteParkingFee)

// Fuel refills
router.get('/fuel-refills', controller.getFuelRefills)
router.post('/fuel-refills', controller.createFuelRefill)
router.delete('/fuel-refills/:id', controller.deleteFuelRefill)

// Periods
router.get('/periods', controller.getPeriods)
router.post('/periods', controller.createPeriod)
router.get('/periods/:id', controller.getPeriodDetail)

// Report
router.get('/report', controller.getReport)

export default router
