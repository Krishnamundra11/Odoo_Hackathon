import apiClient from '../../../services/apiClient';

export const getKpis = () => apiClient.get('/dashboard/kpis');
export const getOverdue = () => apiClient.get('/dashboard/overdue');
export const getRecentActivity = () => apiClient.get('/activity-logs', { params: { limit: 4 } });