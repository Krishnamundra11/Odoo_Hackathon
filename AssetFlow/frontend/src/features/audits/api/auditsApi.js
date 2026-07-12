import apiClient from '../../../services/apiClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const getActiveAuditCycle = async () => {
  const cycle = unwrap(await apiClient.get('/audits/active'));
  if (!cycle || !cycle.id) return null;

  const startDate = cycle.start_date
    ? new Date(cycle.start_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const endDate = cycle.end_date
    ? new Date(cycle.end_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';

  return {
    id:         cycle.id,
    name:       cycle.name || 'Audit Cycle',
    scope:      cycle.scope_department_name || cycle.scope_location || 'Organization-wide',
    dateRange:  `${startDate} — ${endDate}`,
    status:     cycle.status,
    auditors:   cycle.auditor_names || [],
    items: (cycle.items || []).map((item) => ({
      itemId:           item.id,
      assetId:          item.asset_id,
      assetTag:         item.asset_tag  || '',
      assetName:        item.asset_name || '',
      assetStatus:      item.asset_status || '',
      expectedLocation: item.expected_location || 'Assigned Location',
      result:           item.result || 'pending',
      notes:            item.notes || '',
      auditedBy:        item.audited_by_name || '',
      auditedAt:        item.audited_at || null,
    })),
  };
};

// GET /api/audits/cycles/:id/discrepancy-report
export const getDiscrepancyReport = async (cycleId) => {
  const data = unwrap(await apiClient.get(`/audits/cycles/${cycleId}/discrepancy-report`));
  return data; // { cycle, discrepancies[] }
};

// PATCH /api/audits/:auditId/items/:assetId  — mark result (verified/missing/damaged/pending)
export const markAuditItem = async (auditId, assetId, result, notes = '') => {
  const data = unwrap(await apiClient.patch(`/audits/${auditId}/items/${assetId}`, { verification: result, result, notes }));
  return data;
};

// POST /api/audits/:id/close
export const closeAuditCycle = async (auditId) => {
  const data = unwrap(await apiClient.post(`/audits/${auditId}/close`));
  return data;
};

// POST /api/audits/cycles — create a new cycle (Asset Manager only)
export const createAuditCycle = async (payload) => {
  const data = unwrap(await apiClient.post('/audits/cycles', payload));
  return data;
};