/**
 * Transfer Request Routes
 *
 * POST   /api/v1/transfer-requests                   — create
 * PATCH  /api/v1/transfer-requests/:id/approve       — approve
 * PATCH  /api/v1/transfer-requests/:id/reject        — reject
 */
const express = require('express');
const router = express.Router();
const allocController = require('./allocation.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorize = require('../../middlewares/rbac.middleware');
const validateRequest = require('../../middlewares/validateRequest');
const { createTransferRequestSchema, transferActionSchema } = require('./allocation.validators');
const { ROLES } = require('../../shared/roles');

router.use(authenticate);

// Any authenticated user can request a transfer
router.post(
  '/',
  validateRequest(createTransferRequestSchema),
  allocController.createTransferRequest
);

// Approve — Asset Manager or Dept Head
router.patch(
  '/:id/approve',
  authorize(ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD),
  validateRequest(transferActionSchema),
  allocController.approveTransfer
);

// Reject — Asset Manager or Dept Head
router.patch(
  '/:id/reject',
  authorize(ROLES.ASSET_MANAGER, ROLES.DEPARTMENT_HEAD),
  validateRequest(transferActionSchema),
  allocController.rejectTransfer
);

module.exports = router;
