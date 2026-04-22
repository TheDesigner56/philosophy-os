import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DetailPanel from '@/components/DetailPanel';
import { EXAMPLE_NODES, EXAMPLE_CONNECTIONS } from '@/data/examples';

// Simple mocks so we don't need full portal/animation logic in unit tests
vi.mock('@/components/BottomSheet', () => ({
  default: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="bottom-sheet">{children}</div> : null,
}));

vi.mock('@/components/DeleteConfirm', () => ({
  default: ({
    open,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      <div data-testid="delete-confirm">
        <button onClick={onConfirm}>Confirm delete</button>
        <button onClick={onCancel}>Cancel delete</button>
      </div>
    ) : null,
}));

// form-1: 'Live deliberately'
// Connected via: link('goal-1', 'form-1') → goal-1 is a peer
//                link('form-1', 'form-2') → form-2 is a peer
const node = EXAMPLE_NODES.find((n) => n.id === 'form-1')!;

const defaultProps = {
  node,
  allNodes: EXAMPLE_NODES,
  connections: EXAMPLE_CONNECTIONS,
  onUpdate: vi.fn(),
  onDelete: vi.fn(),
  onClose: vi.fn(),
  onNavigate: vi.fn(),
};

describe('DetailPanel', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the node label', () => {
    render(<DetailPanel {...defaultProps} />);
    expect(screen.getAllByText(node.label).length).toBeGreaterThanOrEqual(1);
  });

  it('renders the category name', () => {
    render(<DetailPanel {...defaultProps} />);
    expect(screen.getAllByText('Form').length).toBeGreaterThanOrEqual(1);
  });

  it('renders notes textarea with current notes', () => {
    render(<DetailPanel {...defaultProps} />);
    const textareas = screen.getAllByPlaceholderText('Add your thoughts...');
    expect((textareas[0] as HTMLTextAreaElement).value).toBe(node.notes);
  });

  it('calls onUpdate when label input changes', () => {
    const onUpdate = vi.fn();
    render(<DetailPanel {...defaultProps} onUpdate={onUpdate} />);
    const inputs = screen.getAllByDisplayValue(node.label);
    fireEvent.change(inputs[0], { target: { value: 'Updated label' } });
    expect(onUpdate).toHaveBeenCalledWith(node.id, { label: 'Updated label' });
  });

  it('calls onUpdate when notes textarea changes', () => {
    const onUpdate = vi.fn();
    render(<DetailPanel {...defaultProps} onUpdate={onUpdate} />);
    const textareas = screen.getAllByPlaceholderText('Add your thoughts...');
    fireEvent.change(textareas[0], { target: { value: 'New notes content' } });
    expect(onUpdate).toHaveBeenCalledWith(node.id, { notes: 'New notes content' });
  });

  it('shows DeleteConfirm dialog when Delete node button is clicked', () => {
    render(<DetailPanel {...defaultProps} />);
    fireEvent.click(screen.getAllByText('Delete node')[0]);
    expect(screen.getByTestId('delete-confirm')).toBeDefined();
  });

  it('calls onDelete after confirming deletion', () => {
    const onDelete = vi.fn();
    render(<DetailPanel {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText('Delete node')[0]);
    fireEvent.click(screen.getByText('Confirm delete'));
    expect(onDelete).toHaveBeenCalledWith(node.id);
  });

  it('does not call onDelete when deletion is cancelled', () => {
    const onDelete = vi.fn();
    render(<DetailPanel {...defaultProps} onDelete={onDelete} />);
    fireEvent.click(screen.getAllByText('Delete node')[0]);
    fireEvent.click(screen.getByText('Cancel delete'));
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('calls onClose when desktop close (×) button is clicked', () => {
    const onClose = vi.fn();
    render(<DetailPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('renders connected node labels', () => {
    render(<DetailPanel {...defaultProps} />);
    // form-1 is connected to form-2 ('Protect my time') and goal-1 ('Financial freedom')
    expect(screen.getAllByText('Protect my time').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Financial freedom').length).toBeGreaterThanOrEqual(1);
  });

  it('calls onNavigate when a connected node button is clicked', () => {
    const onNavigate = vi.fn();
    render(<DetailPanel {...defaultProps} onNavigate={onNavigate} />);
    const btns = screen.getAllByText('Protect my time');
    fireEvent.click(btns[0]);
    expect(onNavigate).toHaveBeenCalledWith('form-2');
  });
});
