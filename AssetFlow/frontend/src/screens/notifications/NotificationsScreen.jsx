import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Calendar, ArrowLeftRight } from 'lucide-react';
import { LoadingState, ErrorState, EmptyState } from '../../components/ui/StatusBadge';
import * as notificationsApi from '../../features/notifications/api/notificationsApi';

const TABS = ['All', 'Alerts', 'Approvals', 'Bookings'];
const ICONS = { alert: AlertTriangle, approval: CheckCircle2, booking: Calendar, transfer: ArrowLeftRight };

export default function NotificationsScreen() {
  const [tab, setTab] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [marking, setMarking] = useState(false);

  const load = () => {
    setLoading(true);
    setError('');
    notificationsApi
      .getNotifications(tab.toLowerCase())
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(err.message || 'Could not load notifications.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [tab]);

  const handleMarkAllRead = async () => {
    setMarking(true);
    try {
      await notificationsApi.markAllRead();
      load();
    } catch (err) {
      setError(err.message || 'Could not mark notifications as read.');
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-[#061E29]">Notifications</h1>

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              tab === t ? 'border-[#1D546D] bg-[#1D546D] text-white' : 'border-gray-200 bg-white text-[#061E29] hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-2">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="No notifications here." />
        ) : (
          <ul className="divide-y divide-gray-100">
            {items.map((n) => {
              const Icon = ICONS[n.type] || CheckCircle2;
              return (
                <li key={n.id} className="flex items-center gap-3 p-4">
                  <Icon className="h-4 w-4 shrink-0 text-[#1D546D]" />
                  <p className="flex-1 text-sm text-[#061E29]">{n.message}</p>
                  <span className="shrink-0 text-xs text-gray-400">{n.timeAgo}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <button
        onClick={handleMarkAllRead}
        disabled={marking}
        className="w-full rounded-lg border border-[#1D546D] py-2.5 text-sm font-medium text-[#1D546D] hover:bg-[#1D546D] hover:text-white disabled:opacity-50"
      >
        {marking ? 'Marking...' : 'Mark all as read'}
      </button>
    </div>
  );
}