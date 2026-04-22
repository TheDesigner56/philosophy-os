import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPanel from '@/components/AddPanel';
import { CATEGORY_ORDER, CATEGORIES } from '@/types';

describe('AddPanel', () => {
  const onAdd = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders text input', () => {
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders a category pill for each category', () => {
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    for (const c of CATEGORY_ORDER) {
      expect(screen.getByText(CATEGORIES[c].name)).toBeInTheDocument();
    }
  });

  it('renders mic button', () => {
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    expect(screen.getByLabelText('Voice input')).toBeInTheDocument();
  });

  it('renders close button', () => {
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    expect(screen.getByText('close')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.click(screen.getByText('close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when Escape pressed', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onAdd with typed label when Enter pressed', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.type(screen.getByRole('textbox'), 'my new thought{Enter}');
    expect(onAdd).toHaveBeenCalledWith('thought', 'my new thought');
  });

  it('calls onAdd when + button clicked with label', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.type(screen.getByRole('textbox'), 'test label');
    await user.click(screen.getByText('+'));
    expect(onAdd).toHaveBeenCalledWith('thought', 'test label');
  });

  it('does not call onAdd when label is empty', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.keyboard('{Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('clears input after adding', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'hello{Enter}');
    expect(input).toHaveValue('');
  });

  it('changes selected category when pill clicked', async () => {
    const user = userEvent.setup();
    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.click(screen.getByText('Form'));
    await user.type(screen.getByRole('textbox'), 'test{Enter}');
    expect(onAdd).toHaveBeenCalledWith('form', 'test');
  });

  it('shows unsupported message when SpeechRecognition is unavailable', async () => {
    const user = userEvent.setup();
    // Ensure window has no SpeechRecognition
    const win = window as unknown as Record<string, unknown>;
    delete win.SpeechRecognition;
    delete win.webkitSpeechRecognition;

    render(<AddPanel onAdd={onAdd} onClose={onClose} />);
    await user.click(screen.getByLabelText('Voice input'));
    expect(screen.getByText('Voice input not supported in this browser')).toBeInTheDocument();
  });
});
