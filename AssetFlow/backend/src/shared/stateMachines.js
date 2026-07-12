/**
 * State Machines — single source of truth for all status transitions.
 * Every transition in the system MUST go through validateTransition().
 *
 * These match the Postgres enums in assetflow_schema.sql exactly.
 */

const { ConflictError } = require('../utils/errors');

// §5.1 — Asset lifecycle
const ASSET_TRANSITIONS = {
  available:          ['allocated', 'reserved', 'under_maintenance', 'lost', 'retired'],
  allocated:          ['available', 'retired'],
  reserved:           ['available'],
  under_maintenance:  ['available'],
  lost:               [],          // terminal
  retired:            ['disposed'],
  disposed:           [],          // terminal
};

// §5.2 — Maintenance workflow
const MAINTENANCE_TRANSITIONS = {
  pending:              ['approved', 'rejected'],
  approved:             ['technician_assigned'],
  technician_assigned:  ['in_progress'],
  in_progress:          ['resolved'],
  rejected:             [],        // terminal
  resolved:             [],        // terminal
};

// §5.3 — Transfer workflow
const TRANSFER_TRANSITIONS = {
  requested:  ['approved', 'rejected'],
  approved:   ['completed'],
  rejected:   [],                  // terminal
  completed:  [],                  // terminal
};

// §5.4 — Audit cycle
const AUDIT_CYCLE_TRANSITIONS = {
  planned:      ['in_progress'],
  in_progress:  ['closed'],
  closed:       [],                // terminal
};

/**
 * Validate a state transition against the given map.
 * @param {Object} transitionMap - One of the *_TRANSITIONS objects above.
 * @param {string} currentStatus - The current status value.
 * @param {string} newStatus - The desired status value.
 * @param {string} [errorCode] - Custom error code for the 409 response.
 * @returns {boolean} true if valid
 * @throws {ConflictError} if transition is not allowed
 */
function validateTransition(transitionMap, currentStatus, newStatus, errorCode = 'INVALID_STATE_TRANSITION') {
  const allowed = transitionMap[currentStatus];
  if (!allowed || !allowed.includes(newStatus)) {
    const err = new ConflictError(`Cannot transition from '${currentStatus}' to '${newStatus}'`);
    err.code = errorCode;
    throw err;
  }
  return true;
}

module.exports = {
  ASSET_TRANSITIONS,
  MAINTENANCE_TRANSITIONS,
  TRANSFER_TRANSITIONS,
  AUDIT_CYCLE_TRANSITIONS,
  validateTransition,
};
