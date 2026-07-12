/**
 * Allocation Repository — raw parameterized SQL via `pg`, no business logic.
 */
const { pool, query } = require('../../config/db');

/**
 * Create allocation.
 */
async function create(data, client = null) {
  const queryFn = client || { query: (text, params) => query(text, params) };
  const { rows } = await queryFn.query(
    `INSERT INTO allocations (
      asset_id, employee_id, department_id, allocated_date,
      expected_return_date, status, allocated_by
    ) VALUES ($1, $2, $3, $4, $5, 'active', $6)
    RETURNING *`,
    [
      data.asset_id,
      data.employee_id || null,
      data.department_id || null,
      data.allocated_date || new Date().toISOString(),
      data.expected_return_date || null,
      data.allocated_by,
    ]
  );
  return rows[0];
}

/**
 * Find allocation by ID.
 */
async function findById(id, client = null) {
  const queryFn = client || { query: (text, params) => query(text, params) };
  const { rows } = await queryFn.query(
    `SELECT al.*, u.name AS employee_name, d.name AS department_name,
            ab.name AS allocated_by_name, a.asset_tag
     FROM allocations al
     LEFT JOIN users u ON al.employee_id = u.id
     LEFT JOIN departments d ON al.department_id = d.id
     LEFT JOIN users ab ON al.allocated_by = ab.id
     LEFT JOIN assets a ON al.asset_id = a.id
     WHERE al.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Find the active allocation for a given asset.
 */
async function findActiveByAssetId(assetId, client = null) {
  const queryFn = client || { query: (text, params) => query(text, params) };
  const { rows } = await queryFn.query(
    `SELECT al.*, u.name AS employee_name
     FROM allocations al
     LEFT JOIN users u ON al.employee_id = u.id
     WHERE al.asset_id = $1 AND al.status = 'active'`,
    [assetId]
  );
  return rows[0] || null;
}

/**
 * List allocations with optional overdue filter and pagination.
 */
async function findAll(filters, limit, offset) {
  const conditions = [];
  const values = [];
  let idx = 1;

  if (filters.overdue === 'true') {
    conditions.push(`al.status = 'active'`);
    conditions.push(`al.expected_return_date IS NOT NULL`);
    conditions.push(`al.expected_return_date < NOW()`);
  }
  if (filters.asset_id) {
    conditions.push(`al.asset_id = $${idx++}`);
    values.push(filters.asset_id);
  }
  if (filters.employee_id) {
    conditions.push(`al.employee_id = $${idx++}`);
    values.push(filters.employee_id);
  }
  if (filters.status) {
    conditions.push(`al.status = $${idx++}`);
    values.push(filters.status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM allocations al ${whereClause}`,
    values
  );
  const total = parseInt(countResult.rows[0].total, 10);

  values.push(limit);
  values.push(offset);

  const { rows } = await query(
    `SELECT al.*, u.name AS employee_name, d.name AS department_name,
            ab.name AS allocated_by_name, a.asset_tag
     FROM allocations al
     LEFT JOIN users u ON al.employee_id = u.id
     LEFT JOIN departments d ON al.department_id = d.id
     LEFT JOIN users ab ON al.allocated_by = ab.id
     LEFT JOIN assets a ON al.asset_id = a.id
     ${whereClause}
     ORDER BY al.allocated_date DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    values
  );

  return { rows, total };
}

/**
 * Return an allocation (set status=returned, actual_return_date, notes).
 */
async function returnAllocation(id, data, client = null) {
  const queryFn = client || { query: (text, params) => query(text, params) };
  const { rows } = await queryFn.query(
    `UPDATE allocations
     SET status = 'returned',
         actual_return_date = $1,
         return_condition_notes = $2
     WHERE id = $3
     RETURNING *`,
    [
      data.actual_return_date || new Date().toISOString(),
      data.return_condition_notes || null,
      id,
    ]
  );
  return rows[0] || null;
}

// ───────────────────────────────────────────────────────────
// Transfer Request queries
// ───────────────────────────────────────────────────────────

/**
 * Create a transfer request.
 */
async function createTransferRequest(data) {
  const { rows } = await query(
    `INSERT INTO transfer_requests (
      asset_id, from_allocation_id, requested_by,
      requested_to_employee_id, status
    ) VALUES ($1, $2, $3, $4, 'requested')
    RETURNING *`,
    [data.asset_id, data.from_allocation_id, data.requested_by, data.requested_to_employee_id]
  );
  return rows[0];
}

/**
 * Find transfer request by ID.
 */
async function findTransferById(id, client = null) {
  const queryFn = client || { query: (text, params) => query(text, params) };
  const { rows } = await queryFn.query(
    `SELECT tr.*, a.asset_tag, a.department_id AS asset_department_id,
            u_from.name AS requested_by_name,
            u_to.name AS requested_to_name,
            u_approved.name AS approved_by_name
     FROM transfer_requests tr
     LEFT JOIN assets a ON tr.asset_id = a.id
     LEFT JOIN users u_from ON tr.requested_by = u_from.id
     LEFT JOIN users u_to ON tr.requested_to_employee_id = u_to.id
     LEFT JOIN users u_approved ON tr.approved_by = u_approved.id
     WHERE tr.id = $1`,
    [id]
  );
  return rows[0] || null;
}

/**
 * Update transfer request status.
 */
async function updateTransferStatus(id, status, approvedBy, client = null) {
  const queryFn = client || { query: (text, params) => query(text, params) };
  const { rows } = await queryFn.query(
    `UPDATE transfer_requests
     SET status = $1, approved_by = $2
     WHERE id = $3
     RETURNING *`,
    [status, approvedBy, id]
  );
  return rows[0] || null;
}

module.exports = {
  create,
  findById,
  findActiveByAssetId,
  findAll,
  returnAllocation,
  createTransferRequest,
  findTransferById,
  updateTransferStatus,
};
