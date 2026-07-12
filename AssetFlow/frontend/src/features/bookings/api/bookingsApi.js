import apiClient from '../../../services/apiClient';

export const getResources = () => apiClient.get('/resources');
export const getBookingsForResource = (resourceId, date) =>
  apiClient.get(`/resources/${resourceId}/bookings`, { params: { date } });
export const createBooking = (payload) => apiClient.post('/bookings', payload);