import apiClient from '../../../services/apiClient';

export const getMaintenanceRequests = (status) =>
  apiClient.get('/maintenance', { params: status && status !== 'all' ? { status } : {} });

export const createMaintenanceRequest = (payload) => apiClient.post('/maintenance', payload);
export const updateMaintenanceStatus = (id, payload) => apiClient.patch(`/maintenance/${id}`, payload);