import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login.jsx';

function makeV(overrides = {}) {
  return {
    loginRole: 'individual',
    setLoginRole: vi.fn(),
    loginEmail: '',
    setLoginEmail: vi.fn(),
    loginPassword: '',
    setLoginPassword: vi.fn(),
    loginRemember: false,
    setLoginRemember: vi.fn(),
    loginError: null,
    loginBusy: false,
    submitLogin: vi.fn(),
    go: () => vi.fn(),
    ...overrides,
  };
}

describe('Login screen', () => {
  it('types into the email and password fields', async () => {
    const v = makeV();
    render(<Login v={v} />);

    await userEvent.type(screen.getByPlaceholderText('you@example.com'), 'a@b.com');
    expect(v.setLoginEmail).toHaveBeenCalled();

    await userEvent.type(screen.getByPlaceholderText('Your password'), 'secret');
    expect(v.setLoginPassword).toHaveBeenCalled();
  });

  it('submits the login form', async () => {
    const v = makeV();
    render(<Login v={v} />);
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    expect(v.submitLogin).toHaveBeenCalledTimes(1);
  });

  it('shows a server-provided login error', () => {
    render(<Login v={makeV({ loginError: 'Password incorrect' })} />);
    expect(screen.getByText('Password incorrect')).toBeInTheDocument();
  });

  it('disables the submit button while a login is in flight', () => {
    render(<Login v={makeV({ loginBusy: true })} />);
    expect(screen.getByRole('button', { name: 'Logging in…' })).toBeDisabled();
  });

  it('switches the caregiver/individual tab', async () => {
    const v = makeV();
    render(<Login v={v} />);
    await userEvent.click(screen.getByRole('button', { name: 'Caregiver' }));
    expect(v.setLoginRole).toHaveBeenCalledWith('caregiver');
  });
});
