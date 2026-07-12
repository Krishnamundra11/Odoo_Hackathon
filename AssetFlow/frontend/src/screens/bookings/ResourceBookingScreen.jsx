import { useEffect, useState } from 'react';
import { LoadingState, ErrorState } from '../../components/ui/StatusBadge';
import * as bookingsApi from '../../features/bookings/api/bookingsApi';

const START_HOUR = 9;
const END_HOUR = 13; // 1:00 PM
const HOUR_HEIGHT = 60; // px per hour

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return (h - START_HOUR) * 60 + m;
}

export default function ResourceBookingScreen() {
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState('');
  const [date] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [slot, setSlot] = useState({ start: '', end: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bookingsApi
      .getResources()
      .then((res) => {
        const list = res.data || [];
        setResources(list);
        if (list[0]) setResourceId(list[0].id);
      })
      .catch((err) => setError(err.message || 'Could not load resources.'))
      .finally(() => setLoading(false));
  }, []);

  const loadBookings = () => {
    if (!resourceId) return;
    setLoading(true);
    setError('');
    bookingsApi
      .getBookingsForResource(resourceId, date)
      .then((res) => setBookings(res.data || []))
      .catch((err) => setError(err.message || 'Could not load bookings for this resource.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadBookings, [resourceId, date]);

  const handleBook = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await bookingsApi.createBooking({ resourceId, date, startTime: slot.start, endTime: slot.end });
      setShowForm(false);
      setSlot({ start: '', end: '' });
      loadBookings();
    } catch (err) {
      // backend returns 409 BOOKING_OVERLAP when the slot conflicts
      setFormError(err.message || 'This slot overlaps an existing booking. Please choose another time.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedResource = resources.find((r) => r.id === resourceId);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#061E29]">Resource Booking</h1>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <label className="mb-1 block text-sm font-medium text-[#061E29]">Resource</label>
        <select
          value={resourceId}
          onChange={(e) => setResourceId(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm text-[#061E29] focus:border-[#1D546D] focus:outline-none"
        >
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} — {new Date(date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' })}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={loadBookings} />
        ) : (
          <div className="relative flex">
            {/* hour labels */}
            <div className="w-16 shrink-0">
              {hours.map((h) => (
                <div key={h} style={{ height: HOUR_HEIGHT }} className="text-xs text-gray-400">
                  {h > 12 ? h - 12 : h}:00 {h >= 12 ? 'PM' : 'AM'}
                </div>
              ))}
            </div>
            {/* grid + bookings */}
            <div className="relative flex-1 border-l border-gray-100">
              {hours.map((h) => (
                <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-100" />
              ))}
              {bookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    top: (timeToMinutes(b.startTime) / 60) * HOUR_HEIGHT,
                    height: ((timeToMinutes(b.endTime) - timeToMinutes(b.startTime)) / 60) * HOUR_HEIGHT,
                  }}
                  className={`absolute left-2 right-2 rounded-lg border px-3 py-1 text-xs ${
                    b.status === 'conflict'
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-[#1D546D]/30 bg-[#1D546D]/10 text-[#1D546D]'
                  }`}
                >
                  {b.status === 'conflict'
                    ? `Requested ${b.startTime} to ${b.endTime} - conflict - slot is unavailable`
                    : `Booked - ${b.bookedBy} - ${b.startTime} to ${b.endTime}`}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="rounded-lg bg-[#1D546D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#061E29]"
        >
          Book a Slot
        </button>
      ) : (
        <form onSubmit={handleBook} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4">
          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{formError}</div>
          )}
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#061E29]">Start</label>
              <input type="time" required value={slot.start} onChange={(e) => setSlot({ ...slot, start: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1D546D] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#061E29]">End</label>
              <input type="time" required value={slot.end} onChange={(e) => setSlot({ ...slot, end: e.target.value })}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#1D546D] focus:outline-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-[#1D546D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#061E29] disabled:opacity-50">
              {submitting ? 'Booking...' : 'Confirm Booking'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}