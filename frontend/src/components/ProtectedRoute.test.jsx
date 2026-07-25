import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute, { PublicOnlyRoute } from './ProtectedRoute.jsx';

function renderAt(path, v, extraRoutes = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/dashboard" element={<div>Individual Dashboard</div>} />
        <Route path="/caregiver-dashboard" element={<div>Caregiver Dashboard</div>} />
        <Route path="/protected" element={<ProtectedRoute v={v} {...extraRoutes}><div>Secret Content</div></ProtectedRoute>} />
        <Route path="/public-only" element={<PublicOnlyRoute v={v}><div>Signup Page</div></PublicOnlyRoute>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects to /login when not authenticated', () => {
    renderAt('/protected', { isAuthenticated: false, role: 'individual' });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('renders the protected content when authenticated with no role restriction', () => {
    renderAt('/protected', { isAuthenticated: true, role: 'individual' });
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });

  it('redirects an individual away from a caregiver-only route', () => {
    renderAt('/protected', { isAuthenticated: true, role: 'individual' }, { allow: ['caregiver'] });
    expect(screen.getByText('Individual Dashboard')).toBeInTheDocument();
  });

  it('redirects a caregiver away from an individual-only route', () => {
    renderAt('/protected', { isAuthenticated: true, role: 'caregiver' }, { allow: ['individual'] });
    expect(screen.getByText('Caregiver Dashboard')).toBeInTheDocument();
  });

  it('allows access when the role matches the restriction', () => {
    renderAt('/protected', { isAuthenticated: true, role: 'caregiver' }, { allow: ['caregiver'] });
    expect(screen.getByText('Secret Content')).toBeInTheDocument();
  });
});

describe('PublicOnlyRoute', () => {
  it('renders the public page when logged out', () => {
    renderAt('/public-only', { isAuthenticated: false, role: 'individual' });
    expect(screen.getByText('Signup Page')).toBeInTheDocument();
  });

  it('bounces an already-authenticated individual to their dashboard', () => {
    renderAt('/public-only', { isAuthenticated: true, role: 'individual' });
    expect(screen.getByText('Individual Dashboard')).toBeInTheDocument();
  });

  it('bounces an already-authenticated caregiver to their dashboard', () => {
    renderAt('/public-only', { isAuthenticated: true, role: 'caregiver' });
    expect(screen.getByText('Caregiver Dashboard')).toBeInTheDocument();
  });
});
