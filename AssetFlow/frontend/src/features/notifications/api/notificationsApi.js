import apiClient from '../../../services/apiClient';

export const getNotifications = (filter) =>
  apiClient.get('/notifications', { params: filter && filter !== 'all' ? { category: filter } : {} });
export const markAllRead = () => apiClient.post('/notifications/mark-all-read');