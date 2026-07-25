import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard.jsx';

function makeV(overrides = {}) {
  return {
    email: 'jordan@example.com',
    go: () => vi.fn(),
    logout: vi.fn(),
    voiceState: 'idle',
    voiceTranscript: '',
    setVoiceTranscript: vi.fn(),
    startVoiceFlow: vi.fn(),
    stopVoiceFlow: vi.fn(),
    submitVoiceTranscript: vi.fn(),
    autoSubmit: true,
    setAutoSubmit: vi.fn(),
    aiDay: 12,
    aiMeterLabel: 'Building understanding',
    weekStrip: [{ label: 'M', level: 'low' }, { label: 'T', level: 'high' }],
    topRiskDay: null,
    levelColor: () => '#ccc',
    ...overrides,
  };
}

describe('Dashboard screen', () => {
  it('labels the mic button for a screen reader when idle', () => {
    render(<Dashboard v={makeV()} />);
    expect(screen.getByRole('button', { name: 'Start speaking to careOcare' })).toBeInTheDocument();
  });

  it('starts the voice flow when the mic is tapped', async () => {
    const v = makeV();
    render(<Dashboard v={v} />);
    await userEvent.click(screen.getByRole('button', { name: 'Start speaking to careOcare' }));
    expect(v.startVoiceFlow).toHaveBeenCalledTimes(1);
  });

  it('relabels and stops the mic while listening', async () => {
    const v = makeV({ voiceState: 'listening' });
    render(<Dashboard v={v} />);
    const micButton = screen.getByRole('button', { name: 'Stop recording' });
    expect(micButton).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(micButton);
    expect(v.stopVoiceFlow).toHaveBeenCalledTimes(1);
  });

  it('shows an honest "no elevated risk" message when there is no risk data yet', () => {
    render(<Dashboard v={makeV({ topRiskDay: null })} />);
    expect(screen.getByText(/No elevated risk detected this week yet/)).toBeInTheDocument();
  });

  it('surfaces the real top risk day instead of hardcoded copy', () => {
    const v = makeV({ topRiskDay: { day: 'Friday', risk_level: 'high', reason: 'isolation pattern detected' } });
    render(<Dashboard v={v} />);
    expect(screen.getByText(/Friday: isolation pattern detected/)).toBeInTheDocument();
  });

  it('toggles auto-submit as an accessible switch', async () => {
    const v = makeV();
    render(<Dashboard v={v} />);
    const toggle = screen.getByRole('switch', { name: /Auto-submit when I stop speaking/i });
    expect(toggle).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(toggle);
    expect(v.setAutoSubmit).toHaveBeenCalledTimes(1);
  });
});
