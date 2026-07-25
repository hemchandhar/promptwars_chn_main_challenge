import { Navigate } from 'react-router-dom';
import { SCREEN_PATHS } from '../state.js';

export default function ProtectedRoute({ v, allow, children }) {
  if (!v.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (allow && !allow.includes(v.role)) {
    const home = v.role === 'caregiver' ? SCREEN_PATHS.caregiverDashboard : SCREEN_PATHS.dashboard;
    return <Navigate to={home} replace />;
  }
  return children;
}

export function PublicOnlyRoute({ v, children }) {
  if (v.isAuthenticated) {
    const home = v.role === 'caregiver' ? SCREEN_PATHS.caregiverDashboard : SCREEN_PATHS.dashboard;
    return <Navigate to={home} replace />;
  }
  return children;
}
