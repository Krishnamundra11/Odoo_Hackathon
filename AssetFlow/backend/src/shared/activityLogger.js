/**
 * Activity Logger Stub
 * Logs actions to console. Replace with real DB insert to activity_logs table later.
 * Signature kept stable so swapping is a one-line import change.
 */
async function logActivity({ userId, action, entityType, entityId, metadata = {} }) {
  // TODO: real implementation inserts into activity_logs table
  console.log('[activity]', { userId, action, entityType, entityId, metadata, timestamp: new Date().toISOString() });
}

module.exports = { logActivity };
