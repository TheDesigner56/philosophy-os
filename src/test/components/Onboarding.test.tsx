import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Onboarding from '@/features/onboarding/Onboarding';
import { StoicProvider } from '@/state/StoicProvider';

function renderOnboarding() {
  return render(
    <StoicProvider>
      <Onboarding />
    </StoicProvider>,
  );
}

describe('Onboarding', () => {
  it('starts on the welcome screen', () => {
    renderOnboarding();
    expect(screen.getByText(/Become unshakeable in 30 days/i)).toBeInTheDocument();
  });

  it('reaches the first-win step and requires a saved entry to continue', async () => {
    const user = userEvent.setup();
    renderOnboarding();

    await user.click(screen.getByRole('button', { name: /continue/i })); // welcome -> outcome
    await user.click(screen.getByRole('button', { name: /continue/i })); // outcome -> first win

    expect(screen.getByText(/Your first win/i)).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText(/what does this bring up/i);
    await user.type(textarea, 'My first reflection');
    await user.click(screen.getByRole('button', { name: /save my first entry/i }));

    expect(screen.getByText(/streak of 1/i)).toBeInTheDocument();
  });
});
