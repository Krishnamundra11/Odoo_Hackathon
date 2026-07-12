/**
 * Reports Controller
 */
const reportsService = require('./reports.service');
const { successResponse } = require('../../utils/response');

const getReportsSummary = async (req, res, next) => {
  try {
    const data = await reportsService.getReportsSummary();
    return successResponse(res, data);
  } catch (e) {
    next(e);
  }
};

const exportReport = async (req, res, next) => {
  try {
    const csvData = await reportsService.exportReport();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="assetflow-report.csv"');
    return res.status(200).send(csvData);
  } catch (e) {
    next(e);
  }
};

module.exports = {
  getReportsSummary,
  exportReport,
};
