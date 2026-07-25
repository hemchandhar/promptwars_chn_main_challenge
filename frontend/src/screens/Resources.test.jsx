import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Resources from './Resources.jsx';

describe('Resources screen', () => {
  it('renders working tel: links for crisis hotlines', () => {
    render(<Resources v={{ role: 'individual', go: () => () => {} }} />);

    const lifeline = screen.getByRole('link', { name: /988 Suicide & Crisis Lifeline/i });
    expect(lifeline).toHaveAttribute('href', 'tel:988');

    const samhsa = screen.getByRole('link', { name: /SAMHSA National Helpline/i });
    expect(samhsa).toHaveAttribute('href', 'tel:18006624357');
  });

  it('renders the crisis text line as an sms: link', () => {
    render(<Resources v={{ role: 'individual', go: () => () => {} }} />);
    const textLine = screen.getByRole('link', { name: /Crisis Text Line/i });
    expect(textLine.getAttribute('href')).toContain('sms:741741');
  });

  it('links out to real outside organizations', () => {
    render(<Resources v={{ role: 'individual', go: () => () => {} }} />);
    const samhsaOrg = screen.getByRole('link', { name: /SAMHSA\.gov/i });
    expect(samhsaOrg).toHaveAttribute('href', 'https://www.samhsa.gov/find-help/national-helpline');
    expect(samhsaOrg).toHaveAttribute('target', '_blank');
  });
});
