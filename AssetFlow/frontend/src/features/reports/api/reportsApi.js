import apiClient from '../../../services/apiClient';

export const getReportsSummary = () => apiClient.get('/reports/summary');
export const exportReport = () => apiClient.get('/reports/export', { params: { format: 'csv' }, responseType: 'blob' });