import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, Users, CalendarClock, ArrowLeftRight, Wrench, Clock,
  AlertTriangle, Plus, CalendarPlus, ArrowRight, Calendar,
  Bell, RefreshCw, Package, Activity, CheckCircle2, XCircle,
  TrendingUp,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../features/auth/hooks/useAuth';
import * as dashboardApi from '../../features/dashboard/api/dashboardApi';

// ── Color maps ─────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  available:        '#1D546D',
  allocated:        '#5F9598',
  under_maintenance:'#eab308',
  reserved:         '#93b7b9',
  retired:          '#94a3b8',
  lost:             '#ef4444',
  disposed:         '#334155',
};

const ACTION_META = {
  BOOKING_CREATED:       { label: 'Booking created',       color: 'bg-blue-100 text-blue-600',    Icon: CalendarClock },
  BOOKING_CANCELLED:     { label: 'Booking cancelled',     color: 'bg-red-100 text-red-600',      Icon: XCircle },
  BOOKING_RESCHEDULED:   { label: 'Booking rescheduled',   color: 'bg-yellow-100 text-yellow-600',Icon: CalendarClock },
  DEPARTMENT_CREATED:    { label: 'Department created',    color: 'bg-teal-100 text-teal-600',    Icon: Plus },
  DEPARTMENT_UPDATED:    { label: 'Department updated',    color: 'bg-teal-100 text-teal-600',    Icon: Activity },
  CATEGORY_CREATED:      { label: 'Category created',      color: 'bg-indigo-100 text-indigo-600',Icon: Plus },
  EMPLOYEE_UPDATED:      { label: 'Employee updated',       color: 'bg-purple-100 text-purple-600',Icon: Users },
  'notification.read':   { label: 'Notification read',    color: 'bg-gray-100 text-gray-500',    Icon: Bell },
  'asset.registered':    { label: 'Asset registered',      color: 'bg-emerald-100 text-emerald-600', Icon: Boxes },
};
const DEFAULT_ACTION_META = { label: 'System event', color: 'bg-gray-100 text-gray-500', Icon: Activity };

const BOOKING_STATUS_BADGE = {
  upcoming:  'bg-blue-50 text-blue-700 border-blue-200',
  ongoing:   'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
  cancelled: 'bg-red-50 text-red-600 border-red-200',
};

const NOTIF_TYPE_COLOR = {
  booking_confirmed:    'bg-emerald-500',
  booking_cancelled:    'bg-orange-500',
  audit_discrepancy:    'bg-purple-500',
  asset_assigned:       'bg-blue-500',
  maintenance_approved: 'bg-teal-500',
  overdue_return:       'bg-red-500',
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sublabel, danger = false, accent }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-3 ${danger ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between">
        <span className={`text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-500'}`}>{label}</span>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${danger ? 'bg-red-100' : 'bg-[#F3F4F4]'}`}>
          <Icon className={`h-4 w-4 ${danger ? 'text-red-500' : accent || 'text-[#1D546D]'}`} />
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight ${danger ? 'text-red-700' : 'text-[#061E29]'}`}>
        {value ?? '—'}
      </p>
      {sublabel && (
        <p className={`text-xs ${danger ? 'text-red-500' : 'text-gray-400'}`}>{sublabel}</p>
      )}
    </div>
  );
}

function QuickAction({ icon: Icon, title, subtitle, onClick, bg }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-5 py-4 text-left text-white transition hover:opacity-90 active:scale-[0.98] ${bg}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-white/70">{subtitle}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 shrink-0" />
    </button>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-xl bg-gray-200 ${className}`} />;
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function DashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis]           = useState(null);
  const [overdue, setOverdue]     = useState(null);
  const [activity, setActivity]   = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [notifs, setNotifs]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [kpisData, overdueData, activityData, bookingsData, notifsData] = await Promise.all([
        dashboardApi.getKpis(),
        dashboardApi.getOverdue(),
        dashboardApi.getRecentActivity().catch(() => []),
        dashboardApi.getRecentBookings().catch(() => ({ bookings: [] })),
        dashboardApi.getNotifications().catch(() => ({ notifications: [] })),
      ]);
      setKpis(kpisData);
      setOverdue(overdueData);
      setActivity(Array.isArray(activityData) ? activityData : []);
      setBookings(bookingsData?.bookings || bookingsData || []);
      setNotifs(notifsData?.notifications || notifsData || []);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || 'Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const overdueCount = overdue?.count ?? 0;
  const breakdown    = kpis?.assetStatusBreakdown || [];
  const totalAssets  = breakdown.reduce((sum, s) => sum + s.count, 0);

  // Build bar chart data from breakdown
  const barData = breakdown.map(s => ({
    name: s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: s.count,
    fill: STATUS_COLORS[s.status] || '#94a3b8',
  }));

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (loading && !kpis) {
    return (
      <div className="space-y-6 animate-pulse">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
        <div className="grid grid-cols-2 gap-6"><Skeleton className="h-64" /><Skeleton className="h-64" /></div>
      </div>
    );
  }

  if (error && !kpis) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
        <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
        <p className="font-medium text-red-700">{error}</p>
        <button onClick={load} className="mt-4 rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#061E29]">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">Here's your live asset overview.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={load}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
            <Calendar className="h-4 w-4 text-[#1D546D]" />
            <div className="text-sm">
              <p className="font-medium text-[#061E29]">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-[10px] text-gray-400">Last updated {relativeTime(lastRefresh)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Row 1 ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Boxes}         label="Available Assets"   value={kpis?.assetsAvailable ?? 0}   sublabel={`of ${totalAssets} total assets`} />
        <KpiCard icon={Package}       label="Allocated Assets"   value={kpis?.assetsAllocated ?? 0}   sublabel={`${kpis?.activeAllocations ?? 0} active allocations`} />
        <KpiCard icon={CalendarClock} label="Active Bookings"    value={kpis?.activeBookings ?? 0}    sublabel="Upcoming + ongoing" />
        <KpiCard icon={ArrowLeftRight} label="Pending Transfers" value={kpis?.pendingTransfers ?? 0}  sublabel="Awaiting approval" />
      </div>

      {/* ── KPI Row 2 ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Wrench}        label="Maintenance Today"  value={kpis?.maintenanceToday ?? 0}  sublabel="Requests raised today" />
        <KpiCard icon={Clock}         label="Upcoming Returns"   value={kpis?.upcomingReturns ?? 0}   sublabel="Due within 7 days" />
        <KpiCard icon={AlertTriangle} label="Overdue Returns"    value={overdueCount}                 danger sublabel="Immediate action required" />
      </div>

      {/* ── Overdue alert banner ────────────────────────────────────────────── */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
            <div>
              <p className="font-medium text-red-700">{overdueCount} asset{overdueCount !== 1 ? 's' : ''} overdue for return</p>
              <p className="text-sm text-red-500">These assets are past their expected return date.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/allocations?filter=overdue')}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            View Details <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Quick Actions ───────────────────────────────────────────────────── */}
      <div>
        <h2 className="mb-3 text-base font-semibold text-[#061E29]">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction icon={Plus}        title="Register Asset"    subtitle="Manage and add new assets"       onClick={() => navigate('/assets?action=new')}        bg="bg-[#061E29]" />
          <QuickAction icon={CalendarPlus} title="Book Resource"    subtitle="Book a room, vehicle or equipment"   onClick={() => navigate('/bookings?action=new')}           bg="bg-[#1D546D]" />
          <QuickAction icon={Wrench}       title="Raise Maintenance" subtitle="Report an issue or request service" onClick={() => navigate('/maintenance')}        bg="bg-[#5F9598]" />
        </div>
      </div>

      {/* ── Charts Row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* Asset Status Donut */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 font-semibold text-[#061E29] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#5F9598]" /> Asset Status Breakdown
          </h2>
          {breakdown.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No asset data yet.</p>
          ) : (
            <div className="flex items-center gap-8">
              <div className="relative h-40 w-40 shrink-0">
                <PieChart width={160} height={160}>
                  <Pie data={breakdown} dataKey="count" nameKey="status" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-[#061E29]">{totalAssets}</span>
                  <span className="text-[10px] font-medium text-gray-400">Total</span>
                </div>
              </div>
              <ul className="flex-1 space-y-2.5">
                {breakdown.map((entry) => (
                  <li key={entry.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS[entry.status] || '#94a3b8' }} />
                      <span className="text-sm capitalize text-[#061E29]">{entry.status.replace(/_/g, ' ')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{entry.count} <span className="text-xs font-normal text-gray-400">({totalAssets ? Math.round((entry.count / totalAssets) * 100) : 0}%)</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Asset Status Bar Chart */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-5 font-semibold text-[#061E29] flex items-center gap-2">
            <Boxes className="h-4 w-4 text-[#5F9598]" /> Count by Status
          </h2>
          {barData.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={barData} barSize={28} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Activity + Bookings + Notifications ────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

        {/* Recent Activity */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#061E29]">Recent Activity</h2>
          </div>
          {activity.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 6).map((item) => {
                const meta = ACTION_META[item.action] || DEFAULT_ACTION_META;
                const { Icon } = meta;
                const assetName = item.metadata?.assetName;
                const deptName  = item.metadata?.name;
                return (
                  <li key={item.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${meta.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-[#061E29] leading-snug">
                        {meta.label}
                        {(assetName || deptName) && (
                          <span className="font-semibold"> – {assetName || deptName}</span>
                        )}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{relativeTime(item.createdAt)}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Upcoming Bookings */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#061E29]">Upcoming Bookings</h2>
            <button onClick={() => navigate('/bookings')} className="text-xs font-medium text-[#1D546D] hover:underline">
              View All →
            </button>
          </div>
          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No active bookings.</p>
          ) : (
            <ul className="space-y-3">
              {bookings.slice(0, 5).map((b) => (
                <li key={b.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#061E29] truncate">{b.assetName}</p>
                      <p className="text-[10px] text-gray-400">{b.bookedByName}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${BOOKING_STATUS_BADGE[b.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatTime(b.startTime)} – {formatTime(b.endTime)}
                    <span className="ml-1 text-gray-400">
                      {new Date(b.startTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-[#061E29]">Notifications</h2>
            <button onClick={() => navigate('/notifications')} className="text-xs font-medium text-[#1D546D] hover:underline">
              View All →
            </button>
          </div>
          {notifs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">No notifications.</p>
          ) : (
            <ul className="space-y-3">
              {notifs.slice(0, 5).map((n) => (
                <li key={n.id} className={`flex items-start gap-3 rounded-xl p-3 ${n.isRead ? 'bg-white border border-gray-100' : 'bg-[#f0f9f8] border border-[#c7e6e3]'}`}>
                  <div className={`mt-1 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-gray-300' : (NOTIF_TYPE_COLOR[n.type] || 'bg-[#369588]')}`} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-xs leading-snug ${n.isRead ? 'text-gray-500' : 'font-medium text-[#061E29]'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{relativeTime(n.createdAt)}</p>
                  </div>
                  {n.isRead && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-300" />}
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}