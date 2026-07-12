import apiClient from '../../../services/apiClient';

export const getAssetAllocation = (assetId) => apiClient.get(`/assets/${assetId}/allocation`);
export const getAllocationHistory = (assetId) => apiClient.get(`/assets/${assetId}/allocation-history`);
export const requestTransfer = (assetId, payload) => apiClient.post(`/assets/${assetId}/transfer-request`, payload);
export const getEmployees = () => apiClient.get('/employees');
export const searchAssets = (query) => apiClient.get('/assets', { params: { search: query } });