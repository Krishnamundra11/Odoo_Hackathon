import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/context/AuthContext';
import ProtectedRoute from './middlewares/ProtectedRoute';
import GuestRoute from './middlewares/GuestRoute';
import AppLayout from './components/layout/AppLayout';
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';
import MaintenanceScreen from './screens/maintenance/MaintenanceScreen';
import ResourceBookingScreen from './screens/bookings/ResourceBookingScreen';
import AllocationScreen from './screens/allocations/AllocationScreen';
import AuditScreen from './screens/audits/AuditScreen';
import ReportsScreen from './screens/reports/ReportsScreen';
import NotificationsScreen from './screens/notifications/NotificationsScreen';
import AssetsScreen from './screens/assets/AssetsScreen';
import OrganizationSetupScreen from './screens/organization/OrganizationSetupScreen';

function ComingSoon({ label }) {
  return <div className="p-8 text-[#061E29]">{label} screen coming soon</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardScreen />} />
              <Route path="/organization-setup" element={<OrganizationSetupScreen />} />
              <Route path="/assets" element={<AssetsScreen />} />
              <Route path="/allocations" element={<AllocationScreen />} />
              <Route path="/bookings" element={<ResourceBookingScreen />} />
              <Route path="/maintenance" element={<MaintenanceScreen />} />
              <Route path="/audits" element={<AuditScreen />} />
              <Route path="/reports" element={<ReportsScreen />} />
              <Route path="/notifications" element={<NotificationsScreen />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}