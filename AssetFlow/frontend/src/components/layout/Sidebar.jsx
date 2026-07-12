import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Boxes, ArrowLeftRight, CalendarClock,
  Wrench, ClipboardCheck, BarChart3, Bell, ChevronsLeft, ChevronsRight,
} from 'lucide-react';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { getInitials } from '../../lib/utils';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/organization-setup', label: 'Organization Setup', icon: Building2, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/assets', label: 'Assets', icon: Boxes, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/allocations', label: 'Allocation & Transfer', icon: ArrowLeftRight, roles: ['admin', 'asset_manager', 'department_head'] },
  { to: '/bookings', label: 'Resource Booking', icon: CalendarClock, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
  { to: '/audits', label: 'Audit', icon: ClipboardCheck, roles: ['admin', 'asset_manager'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['admin', 'asset_manager', 'department_head'] },
  { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['admin', 'asset_manager', 'department_head', 'employee'] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();
  const role = user?.role || 'employee';
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const initials = getInitials(user?.name);

  return (
    <aside
      className={`flex h-screen flex-col bg-[#061E29] text-white transition-all duration-200 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && (
          <div>
            <p className="text-lg font-bold leading-tight">AssetFlow</p>
            <p className="text-xs text-[#5F9598]">Enterprise Asset Management</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="rounded-md p-1.5 text-[#5F9598] hover:bg-white/10"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-[#1D546D] text-white'
                  : 'text-[#5F9598] hover:bg-white/5 hover:text-white'
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1D546D] text-sm font-semibold">
            {initials}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{user?.name}</p>
              <p className="truncate text-xs capitalize text-[#5F9598]">{role.replace('_', ' ')}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function cn(...args) {
  return args.filter(Boolean).join(' ');
}