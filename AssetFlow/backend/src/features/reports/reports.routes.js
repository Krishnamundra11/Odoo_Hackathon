/**
 * Reports Routes
 *
 * GET /api/v1/reports/summary
 * GET /api/v1/reports/export
 */
const express = require('express');
const router = express.Router();
const reportsController = require('./reports.controller');
const authenticate = require('../../middlewares/auth.middleware');

router.use(authenticate);

router.get('/summary', reportsController.getReportsSummary);
router.get('/export', reportsController.exportReport);

module.exports = router;
