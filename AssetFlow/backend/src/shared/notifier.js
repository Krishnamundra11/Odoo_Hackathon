/**
 * Notification Stub
 * Logs notifications to console. Replace with real DB insert to notifications table later.
 * Signature kept stable so swapping is a one-line import change.
 */
async function notify({ userId, type, message, relatedEntityType, relatedEntityId }) {
  // TODO: real implementation inserts into notifications table
  console.log('[notify]', { userId, type, message, relatedEntityType, relatedEntityId, timestamp: new Date().toISOString() });
}

module.exports = { notify };
