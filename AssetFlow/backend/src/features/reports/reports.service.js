/**
 * Reports Service
 */
const { pool } = require('../../config/db');

async function getReportsSummary() {
  const client = await pool.connect();
  try {
    // 1. Utilization by Department (Active Allocations per Department)
    const { rows: utilizationData } = await client.query(`
      SELECT d.name as department, COUNT(aa.id) as value
      FROM allocations aa
      JOIN departments d ON aa.department_id = d.id
      WHERE aa.status = 'active'
      GROUP BY d.name
    `);
    const utilizationByDepartment = utilizationData.map(r => ({ department: r.department, value: parseInt(r.value, 10) }));

    // 2. Maintenance Frequency (Requests created per month over last 6 months)
    const { rows: maintenanceData } = await client.query(`
      SELECT to_char(created_at, 'Mon') as period, COUNT(*) as value
      FROM maintenance_requests
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY to_char(created_at, 'Mon'), date_trunc('month', created_at)
      ORDER BY date_trunc('month', created_at)
    `);
    const maintenanceFrequency = maintenanceData.map(r => ({ period: r.period, value: parseInt(r.value, 10) }));

    // 3. Most Used Assets (Most booked)
    const { rows: mostUsedData } = await client.query(`
      SELECT a.asset_tag as "assetTag", a.name, COUNT(b.id) as "usageCount"
      FROM bookings b
      JOIN assets a ON b.asset_id = a.id
      GROUP BY a.asset_tag, a.name
      ORDER BY "usageCount" DESC
      LIMIT 5
    `);

    // 4. Idle Assets (Assets available for > 30 days without booking/allocation)
    const { rows: idleData } = await client.query(`
      SELECT asset_tag as "assetTag", name, 
             EXTRACT(DAY FROM NOW() - updated_at) as "idleDays"
      FROM assets
      WHERE status = 'available' 
        AND updated_at < NOW() - INTERVAL '15 days'
      ORDER BY "idleDays" DESC
      LIMIT 5
    `);

    // 5. Upcoming Maintenance / Retirement
    const { rows: upcomingMaintenanceData } = await client.query(`
      SELECT asset_tag as "assetTag", name, 'Status: ' || status as note
      FROM assets
      WHERE status IN ('under_maintenance', 'reserved')
      LIMIT 5
    `);

    return {
      utilizationByDepartment,
      maintenanceFrequency,
      mostUsedAssets: mostUsedData.map(r => ({ ...r, usageCount: parseInt(r.usageCount, 10) })),
      idleAssets: idleData.map(r => ({ ...r, idleDays: Math.floor(r.idleDays) })),
      upcomingMaintenance: upcomingMaintenanceData,
    };
  } finally {
    client.release();
  }
}

async function exportReport() {
  // A simple mock CSV export logic
  return "Asset Tag,Asset Name,Status\nAF-001,Laptop,Allocated\nAF-002,Monitor,Available";
}

module.exports = {
  getReportsSummary,
  exportReport,
};
