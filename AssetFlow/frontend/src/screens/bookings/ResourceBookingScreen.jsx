import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingState, ErrorState } from '../../components/ui/StatusBadge';
import * as bookingsApi from '../../features/bookings/api/bookingsApi';

const START_HOUR = 8;
const END_HOUR = 18; // 6:00 PM
const HOUR_HEIGHT = 80; // px per hour

function timeToMinutes(t) {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return (h - START_HOUR) * 60 + m;
}

// Generate a deterministic color palette based on a string ID
function getResourceColors(id) {
  const colors = [
    { bg: 'bg-blue-100', border: 'border-blue-300', text: 'text-blue-700', active: 'bg-blue-600' },
    { bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-700', active: 'bg-emerald-600' },
    { bg: 'bg-purple-100', border: 'border-purple-300', text: 'text-purple-700', active: 'bg-purple-600' },
    { bg: 'bg-orange-100', border: 'border-orange-300', text: 'text-orange-700', active: 'bg-orange-600' },
    { bg: 'bg-pink-100', border: 'border-pink-300', text: 'text-pink-700', active: 'bg-pink-600' },
    { bg: 'bg-teal-100', border: 'border-teal-300', text: 'text-teal-700', active: 'bg-teal-600' },
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function ResourceBookingScreen() {
  const [resources, setResources] = useState([]);
  const [resourceId, setResourceId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [slot, setSlot] = useState({ start: '', end: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowForm(true);
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    bookingsApi
      .getResources()
      .then((res) => {
        const list = res.data || [];
        setResources(list);
        if (list.length > 0 && !resourceId) setResourceId(list[0].id);
      })
      .catch((err) => setError(err.message || 'Could not load resources.'))
      .finally(() => setLoading(false));
  }, []);

  const loadBookings = () => {
    if (!resourceId || !date) return;
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
      setFormError(err.response?.data?.error?.message || err.message || 'This slot overlaps an existing booking.');
    } finally {
      setSubmitting(false);
    }
  };

  const shiftDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().slice(0, 10));
  };

  const selectedResource = resources.find((r) => r.id === resourceId);
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  const colors = getResourceColors(resourceId || '');

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#061E29]">Resource Bookings</h1>
          <p className="text-sm text-gray-500">Manage and schedule shared assets</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
          <select
            value={resourceId}
            onChange={(e) => setResourceId(e.target.value)}
            className="w-48 cursor-pointer appearance-none rounded-lg border-none bg-transparent py-1.5 pl-3 pr-8 text-sm font-medium text-[#061E29] focus:ring-0"
          >
            {resources.length === 0 ? <option>No resources</option> : null}
            {resources.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-1 px-2">
            <button onClick={() => shiftDate(-1)} className="rounded p-1 hover:bg-gray-100"><ChevronLeft className="h-4 w-4 text-gray-500" /></button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="cursor-pointer appearance-none border-none bg-transparent py-1.5 text-sm font-medium text-[#061E29] focus:ring-0 [&::-webkit-calendar-picker-indicator]:opacity-50"
            />
            <button onClick={() => shiftDate(1)} className="rounded p-1 hover:bg-gray-100"><ChevronRight className="h-4 w-4 text-gray-500" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Calendar Grid */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${colors.active}`} />
              <span className="font-semibold text-[#061E29]">{selectedResource?.name || 'Select Resource'}</span>
              <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-gray-500 border border-gray-200">
                {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center"><LoadingState /></div>
          ) : error ? (
            <div className="flex h-64 items-center justify-center"><ErrorState message={error} onRetry={loadBookings} /></div>
          ) : (
            <div className="relative flex-1 overflow-y-auto" style={{ height: '600px' }}>
              <div className="relative flex min-w-[500px]">
                {/* Time Axis */}
                <div className="w-20 shrink-0 border-r border-gray-100 bg-white">
                  {hours.map((h) => (
                    <div key={h} style={{ height: HOUR_HEIGHT }} className="relative">
                      <span className="absolute -top-2.5 right-3 text-xs font-medium text-gray-400">
                        {h === 12 ? '12 PM' : h > 12 ? `${h - 12} PM` : `${h} AM`}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Grid Lines & Events */}
                <div className="relative flex-1 bg-slate-50/30">
                  {hours.map((h) => (
                    <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-gray-100" />
                  ))}

                  {/* Render Bookings */}
                  {bookings.map((b) => {
                    const top = (timeToMinutes(b.startTime) / 60) * HOUR_HEIGHT;
                    const height = ((timeToMinutes(b.endTime) - timeToMinutes(b.startTime)) / 60) * HOUR_HEIGHT;
                    return (
                      <div
                        key={b.id}
                        style={{ top, height }}
                        className={`absolute left-2 right-4 rounded-lg border-l-4 p-2 shadow-sm transition-all hover:shadow-md ${colors.bg} ${colors.border}`}
                      >
                        <div className="flex items-start justify-between">
                          <p className={`text-xs font-semibold ${colors.text}`}>{b.bookedBy}</p>
                          <span className={`text-[10px] font-medium opacity-80 ${colors.text}`}>
                            {b.startTime} - {b.endTime}
                          </span>
                        </div>
                        <p className={`mt-0.5 text-xs opacity-90 ${colors.text} line-clamp-1`}>
                          Status: {b.status}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar / Form */}
        <div className="space-y-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className={`flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 ${colors.active || 'bg-[#1D546D]'}`}
            >
              <Plus className="h-4 w-4" /> New Booking
            </button>
          ) : (
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-sm font-bold text-[#061E29]">Book {selectedResource?.name}</h3>
              <form onSubmit={handleBook} className="space-y-4">
                {formError && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600">{formError}</div>
                )}
                
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">Start</label>
                    <input
                      type="time"
                      required
                      value={slot.start}
                      onChange={(e) => setSlot({ ...slot, start: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-500 uppercase tracking-wider">End</label>
                    <input
                      type="time"
                      required
                      value={slot.end}
                      onChange={(e) => setSlot({ ...slot, end: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 rounded-lg py-2 text-sm font-semibold text-white transition ${colors.active || 'bg-[#1D546D]'} hover:opacity-90 disabled:opacity-50`}
                  >
                    {submitting ? 'Saving...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Quick info card */}
          <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#061E29]">
              <Calendar className="h-4 w-4 text-gray-500" /> Booking Rules
            </h4>
            <ul className="space-y-2 text-xs text-gray-600">
              <li>• Available from 8:00 AM to 6:00 PM</li>
              <li>• Maximum duration: 4 hours per slot</li>
              <li>• Must be booked at least 1 hour in advance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}