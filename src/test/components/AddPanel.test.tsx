import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AddPanel from '@/components/AddPanel';

// Simplified BottomSheet mock — renders children directly so component tests
// can interact with the mobile form elements without real sheet/pointer logic.
vi.mock('@/components/BottomSheet', () => ({
  default: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="bottom-sheet">{children}</div> : null),
}));

const defaultProps = {
  onAdd: vi.fn(),
  onClose: vi.fn(),
};

describe('AddPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all five category pills (desktop)', () => {
    render(<AddPanel {...defaultProps} />);
    // Both mobile + desktop render pills; confirm the 5 category names appear
    expect(screen.getAllByText('Form').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Goal').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Problem').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Thought').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Shadow').length).toBeGreaterThanOrEqual(1);
  });

  it('defaults to "thought" category (placeholder shows it)', () => {
    render(<AddPanel {...defaultProps} />);
    expect(screen.getAllByPlaceholderText('New thought...').length).toBeGreaterThanOrEqual(1);
  });

  it('changes placeholder when category pill is clicked', () => {
    render(<AddPanel {...defaultProps} />);
    // Click the first Form pill
    fireEvent.click(screen.getAllByText('Form')[0]);
    expect(screen.getAllByPlaceholderText('New form...').length).toBeGreaterThanOrEqual(1);
  });

  it('add (+) button is disabled when input is empty', () => {
    render(<AddPanel {...defaultProps} />);
    expect(screen.getByText('+')).toBeDisabled();
  });

  it('add (+) button is enabled when input has text', () => {
    render(<AddPanel {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('New thought...');
    fireEvent.change(inputs[0], { target: { value: 'My thought' } });
    expect(screen.getByText('+')).not.toBeDisabled();
  });

  it('calls onAdd with correct category and trimmed label on + click', () => {
    const onAdd = vi.fn();
    render(<AddPanel {...defaultProps} onAdd={onAdd} />);
    const inputs = screen.getAllByPlaceholderText('New thought...');
    fireEvent.change(inputs[0], { target: { value: '  test thought  ' } });
    fireEvent.click(screen.getByText('+'));
    expect(onAdd).toHaveBeenCalledWith('thought', 'test thought');
  });

  it('submits on Enter key press in input', () => {
    const onAdd = vi.fn();
    render(<AddPanel {...defaultProps} onAdd={onAdd} />);
    const inputs = screen.getAllByPlaceholderText('New thought...');
    fireEvent.change(inputs[0], { target: { value: 'enter test' } });
    fireEvent.keyDown(inputs[0], { key: 'Enter' });
    expect(onAdd).toHaveBeenCalledWith('thought', 'enter test');
  });

  it('calls onClose on Escape key press', () => {
    const onClose = vi.fn();
    render(<AddPanel {...defaultProps} onClose={onClose} />);
    const inputs = screen.getAllByPlaceholderText('New thought...');
    fireEvent.keyDown(inputs[0], { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when desktop close button is clicked', () => {
    const onClose = vi.fn();
    render(<AddPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when mobile Cancel button is clicked', () => {
    const onClose = vi.fn();
    render(<AddPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders mic (Voice input) button', () => {
    render(<AddPanel {...defaultProps} />);
    expect(screen.getAllByLabelText('Voice input').length).toBeGreaterThanOrEqual(1);
  });

  it('clicking mic when SpeechRecognition is unavailable does not throw', () => {
    render(<AddPanel {...defaultProps} />);
    // jsdom has no SpeechRecognition — clicking should handle gracefully
    expect(() => {
      fireEvent.click(screen.getAllByLabelText('Voice input')[0]);
    }).not.toThrow();
  });

  it('does not call onAdd when input is empty and Enter is pressed', () => {
    const onAdd = vi.fn();
    render(<AddPanel {...defaultProps} onAdd={onAdd} />);
    const inputs = screen.getAllByPlaceholderText('New thought...');
    fireEvent.keyDown(inputs[0], { key: 'Enter' });
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('clears input after successful add', () => {
    render(<AddPanel {...defaultProps} />);
    const inputs = screen.getAllByPlaceholderText('New thought...');
    fireEvent.change(inputs[0], { target: { value: 'hello' } });
    fireEvent.click(screen.getByText('+'));
    // After add, label resets — both inputs should be empty
    const afterInputs = screen.getAllByPlaceholderText('New thought...');
    expect((afterInputs[0] as HTMLInputElement).value).toBe('');
  });
});
