import apiClient from '../../../services/apiClient';

export const getActiveAuditCycle = () => apiClient.get('/audits/active');
export const verifyAuditItem = (auditId, assetId, verification) =>
  apiClient.patch(`/audits/${auditId}/items/${assetId}`, { verification });
export const closeAuditCycle = (auditId) => apiClient.post(`/audits/${auditId}/close`);