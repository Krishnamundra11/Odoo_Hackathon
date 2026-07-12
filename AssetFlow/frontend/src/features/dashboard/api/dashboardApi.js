import apiClient from '../../../services/apiClient';

const unwrap = (res) => res?.data?.data ?? res?.data;

export const getKpis           = async () => unwrap(await apiClient.get('/dashboard/kpis'));
export const getOverdue        = async () => unwrap(await apiClient.get('/dashboard/overdue'));
export const getRecentActivity = async () => unwrap(await apiClient.get('/activity-logs', { params: { limit: 8 } }));
// /api/bookings returns { bookings: [], pagination: {} } inside data
export const getRecentBookings = async () => {
  const data = unwrap(await apiClient.get('/bookings', { params: { limit: 5 } }));
  return Array.isArray(data?.bookings) ? { bookings: data.bookings } : { bookings: [] };
};
// /api/notifications returns { notifications: [], pagination: {} } inside data
export const getNotifications  = async () => {
  const data = unwrap(await apiClient.get('/notifications', { params: { limit: 5 } }));
  return Array.isArray(data?.notifications) ? { notifications: data.notifications } : { notifications: [] };
};