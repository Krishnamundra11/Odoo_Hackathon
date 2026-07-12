import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, User, CalendarClock, ArrowLeftRight, Wrench, Clock, AlertTriangle,
  Plus, Wrench as WrenchIcon, CalendarPlus, ArrowRight, Calendar,
} from 'lucide-react';
import { PieChart, Pie, Cell } from 'recharts';
import KpiCard from '../../components/ui/KpiCard';
import { useAuth } from '../../features/auth/hooks/useAuth';
import * as dashboardApi from '../../features/dashboard/api/dashboardApi';

const STATUS_COLORS = {
  available: '#1D546D',
  allocated: '#5F9598',
  under_maintenance: '#eab308',
  reserved: '#93b7b9',
  retired: '#94a3b8',
  lost: '#334155',
  disposed: '#334155',
};

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [overdue, setOverdue] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([
      dashboardApi.getKpis(),
      dashboardApi.getOverdue(),
      dashboardApi.getRecentActivity(),
    ])
      .then(([kpisRes, overdueRes, activityRes]) => {
        if (cancelled) return;
        setKpis(kpisRes.data);
        setOverdue(overdueRes.data);
        setActivity(activityRes.data || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load dashboard data. Please refresh the page.');
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-20 animate-pulse rounded-xl bg-gray-200" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-700">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const overdueCount = overdue?.count ?? 0;
  const breakdown = kpis?.assetStatusBreakdown || [];
  const totalAssets = breakdown.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#061E29]">
            {greeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500">Here's what's happening with your assets today.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2">
          <Calendar className="h-4 w-4 text-[#1D546D]" />
          <div className="text-sm">
            <p className="font-medium text-[#061E29]">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* KPI row 1 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard icon={Boxes} label="Available Assets" value={kpis?.assetsAvailable ?? 0} trend="12% from last week" trendDirection="up" />
        <KpiCard icon={User} label="Allocated Assets" value={kpis?.assetsAllocated ?? 0} trend="5% from last week" trendDirection="down" />
        <KpiCard icon={CalendarClock} label="Active Bookings" value={kpis?.activeBookings ?? 0} trend="8% from last week" trendDirection="up" />
        <KpiCard icon={ArrowLeftRight} label="Pending Transfers" value={kpis?.pendingTransfers ?? 0} trend="2% from last week" trendDirection="down" />
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Wrench} label="Maintenance Today" value={kpis?.maintenanceToday ?? 0} trend="50% from yesterday" trendDirection="up" />
        <KpiCard icon={Clock} label="Upcoming Returns" value={kpis?.upcomingReturns ?? 0} trend="10% from yesterday" trendDirection="up" />
        <KpiCard icon={AlertTriangle} label="Overdue Returns" value={overdueCount} danger />
      </div>

      {/* Overdue banner */}
      {overdueCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="font-medium text-red-700">{overdueCount} assets overdue for return</p>
              <p className="text-sm text-red-500">These assets are past their expected return date.</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/allocations?filter=overdue')}
            className="flex items-center gap-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
          >
            View Details <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-[#061E29]">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <QuickAction icon={Plus} title="Register Asset" subtitle="Add a new asset to the system" onClick={() => navigate('/assets/new')} bg="bg-[#061E29]" />
          <QuickAction icon={CalendarPlus} title="Book Resource" subtitle="Book a room, vehicle or equipment" onClick={() => navigate('/bookings/new')} bg="bg-[#1D546D]" />
          <QuickAction icon={WrenchIcon} title="Raise Maintenance" subtitle="Report an issue or request service" onClick={() => navigate('/maintenance/new')} bg="bg-[#5F9598]" />
        </div>
      </div>

      {/* Recent activity + Asset status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-[#061E29]">Recent Activity</h2>
            <button onClick={() => navigate('/notifications')} className="text-sm font-medium text-[#1D546D] hover:underline">
              View All →
            </button>
          </div>
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No recent activity yet.</p>
          ) : (
            <ul className="space-y-4">
              {activity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F3F4F4]">
                    <Wrench className="h-4 w-4 text-[#1D546D]" />
                  </div>
                  <div>
                    <p className="text-sm text-[#061E29]">{item.message || item.action}</p>
                    <p className="text-xs text-gray-400">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-[#061E29]">Asset Status Overview</h2>
          {breakdown.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-400">No asset data yet.</p>
          ) : (
            <div className="flex items-center gap-6">
              <div className="relative h-40 w-40 shrink-0">
                <PieChart width={160} height={160}>
                  <Pie data={breakdown} dataKey="count" nameKey="status" innerRadius={50} outerRadius={75} paddingAngle={2}>
                    {breakdown.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-[#061E29]">{totalAssets}</span>
                  <span className="text-xs text-gray-400">Total Assets</span>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                {breakdown.map((entry) => (
                  <li key={entry.status} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[entry.status] || '#94a3b8' }} />
                    <span className="capitalize text-[#061E29]">{entry.status.replace('_', ' ')}</span>
                    <span className="text-gray-400">
                      {entry.count} ({totalAssets ? Math.round((entry.count / totalAssets) * 100) : 0}%)
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, title, subtitle, onClick, bg }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between rounded-xl px-5 py-4 text-left text-white transition hover:opacity-90 ${bg}`}
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
      <ArrowRight className="h-4 w-4" />
    </button>
  );
}