import apiClient from '../../../services/apiClient';

export const getResources = () => 
  apiClient.get('/assets', { params: { is_bookable: true } }).then(r => ({ data: r.data.data.assets }));
export const getBookingsForResource = (resourceId, date) => {
  // We fetch bookings for the day. date is YYYY-MM-DD.
  const from = `${date}T00:00:00Z`;
  const to = `${date}T23:59:59Z`;
  return apiClient.get(`/bookings`, { params: { assetId: resourceId, from, to } })
    .then(r => {
      const formattedBookings = r.data.data.bookings.map(b => ({
        ...b,
        startTime: new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        bookedBy: b.bookedByName, // Ensure bookedBy uses the name
      }));
      return { data: formattedBookings };
    });
};
export const createBooking = (payload) => {
  // payload has { resourceId, date, startTime, endTime }
  // We need to convert it to { asset_id, start_time, end_time, purpose }
  const start_time = new Date(`${payload.date}T${payload.startTime}:00`).toISOString();
  const end_time = new Date(`${payload.date}T${payload.endTime}:00`).toISOString();
  return apiClient.post('/bookings', {
    asset_id: payload.resourceId,
    start_time,
    end_time,
    purpose: 'Booking',
  });
};