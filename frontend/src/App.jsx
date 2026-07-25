import { Routes, Route, Navigate } from 'react-router-dom';
import { useCareOcare } from './state.js';
import { colors, fonts } from './theme.js';
import PublicHeader from './components/PublicHeader.jsx';
import ProtectedRoute, { PublicOnlyRoute } from './components/ProtectedRoute.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Welcome from './screens/Welcome.jsx';
import Signup from './screens/Signup.jsx';
import Privacy from './screens/Privacy.jsx';
import Login from './screens/Login.jsx';
import Onboarding from './screens/Onboarding.jsx';
import Dashboard from './screens/Dashboard.jsx';
import Emergency from './screens/Emergency.jsx';
import RiskCalendar from './screens/RiskCalendar.jsx';
import CaregiverDashboard from './screens/CaregiverDashboard.jsx';
import Settings from './screens/Settings.jsx';
import Chat from './screens/Chat.jsx';
import Resources from './screens/Resources.jsx';

export default function App() {
  const v = useCareOcare();

  return (
    <div style={{ minHeight: '100vh', background: colors.bg, fontFamily: fonts.sans, color: colors.text, position: 'relative' }}>
      <PublicHeader v={v} />
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Welcome v={v} />} />
          <Route path="/signup" element={<PublicOnlyRoute v={v}><Signup v={v} /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute v={v}><Login v={v} /></PublicOnlyRoute>} />
          <Route path="/privacy" element={<ProtectedRoute v={v}><Privacy v={v} /></ProtectedRoute>} />
          <Route path="/onboarding" element={<ProtectedRoute v={v}><Onboarding v={v} /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute v={v} allow={['individual']}><Dashboard v={v} /></ProtectedRoute>} />
          <Route path="/emergency" element={<ProtectedRoute v={v} allow={['individual']}><Emergency v={v} /></ProtectedRoute>} />
          <Route path="/risk-calendar" element={<ProtectedRoute v={v} allow={['individual']}><RiskCalendar v={v} /></ProtectedRoute>} />
          <Route path="/caregiver-dashboard" element={<ProtectedRoute v={v} allow={['caregiver']}><CaregiverDashboard v={v} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute v={v}><Settings v={v} /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute v={v}><Chat v={v} /></ProtectedRoute>} />
          <Route path="/resources" element={<ProtectedRoute v={v}><Resources v={v} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}
