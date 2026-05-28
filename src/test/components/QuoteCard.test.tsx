import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuoteCard from '@/features/quotes/QuoteCard';
import { StoicProvider } from '@/state/StoicProvider';
import { Quote } from '@/types';

const quote: Quote = { id: 'q1', text: 'Test quote', author: 'Author', theme: 'calm' };

function renderCard() {
  return render(
    <StoicProvider>
      <QuoteCard quote={quote} onReflect={vi.fn()} />
    </StoicProvider>,
  );
}

describe('QuoteCard', () => {
  it('renders the quote text and author', () => {
    renderCard();
    expect(screen.getByText(/Test quote/)).toBeInTheDocument();
    expect(screen.getByText(/Author/)).toBeInTheDocument();
  });

  it('toggles saved state when Save is tapped', async () => {
    const user = userEvent.setup();
    renderCard();
    const save = screen.getByRole('button', { name: /save quote/i });
    expect(save).toHaveTextContent('Save');
    await user.click(save);
    expect(screen.getByRole('button', { name: /unsave quote/i })).toHaveTextContent('Saved');
  });

  it('calls onReflect when Reflect is tapped', async () => {
    const user = userEvent.setup();
    const onReflect = vi.fn();
    render(
      <StoicProvider>
        <QuoteCard quote={quote} onReflect={onReflect} />
      </StoicProvider>,
    );
    await user.click(screen.getByRole('button', { name: /reflect on quote/i }));
    expect(onReflect).toHaveBeenCalledWith(quote);
  });
});
