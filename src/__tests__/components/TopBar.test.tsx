import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TopBar from '@/components/TopBar';
import { EXAMPLE_NODES, EXAMPLE_CONNECTIONS } from '@/data/examples';

const defaultProps = {
  nodes: EXAMPLE_NODES,
  connectionCount: EXAMPLE_CONNECTIONS.length,
  viewMode: 'canvas' as const,
  searchQuery: '',
  onViewModeChange: vi.fn(),
  onSearchChange: vi.fn(),
  onAddClick: vi.fn(),
};

describe('TopBar', () => {
  it('renders brand name', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText('Philosophy OS')).toBeInTheDocument();
  });

  it('shows node count', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText(`${EXAMPLE_NODES.length} nodes`)).toBeInTheDocument();
  });

  it('shows connection count', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText(`${EXAMPLE_CONNECTIONS.length} links`)).toBeInTheDocument();
  });

  it('renders canvas and list view toggle buttons', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText('Canvas')).toBeInTheDocument();
    expect(screen.getByText('List')).toBeInTheDocument();
  });

  it('calls onViewModeChange with "list" when List button clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(<TopBar {...defaultProps} onViewModeChange={onViewModeChange} />);
    await user.click(screen.getByText('List'));
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('calls onViewModeChange with "canvas" when Canvas button clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(<TopBar {...defaultProps} viewMode="list" onViewModeChange={onViewModeChange} />);
    await user.click(screen.getByText('Canvas'));
    expect(onViewModeChange).toHaveBeenCalledWith('canvas');
  });

  it('renders search input', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('search...')).toBeInTheDocument();
  });

  it('calls onSearchChange when typing in search', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<TopBar {...defaultProps} onSearchChange={onSearchChange} />);
    await user.type(screen.getByPlaceholderText('search...'), 'h');
    expect(onSearchChange).toHaveBeenCalled();
  });

  it('shows clear button when searchQuery is non-empty', () => {
    render(<TopBar {...defaultProps} searchQuery="hello" />);
    expect(screen.getByLabelText('clear search')).toBeInTheDocument();
  });

  it('calls onSearchChange with empty string when clear button clicked', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    render(<TopBar {...defaultProps} searchQuery="hello" onSearchChange={onSearchChange} />);
    await user.click(screen.getByLabelText('clear search'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onAddClick when + button clicked', async () => {
    const user = userEvent.setup();
    const onAddClick = vi.fn();
    render(<TopBar {...defaultProps} onAddClick={onAddClick} />);
    await user.click(screen.getByTitle('Add node (+)'));
    expect(onAddClick).toHaveBeenCalled();
  });
});
