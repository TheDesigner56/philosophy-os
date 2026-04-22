import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TopBar from '@/components/TopBar';
import { EXAMPLE_NODES } from '@/data/examples';

const defaultProps = {
  nodes: EXAMPLE_NODES,
  connectionCount: 6,
  viewMode: 'canvas' as const,
  searchQuery: '',
  onViewModeChange: vi.fn(),
  onSearchChange: vi.fn(),
  onAddClick: vi.fn(),
};

describe('TopBar', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders brand text', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText('ΦΙΛΟΣΟΦΙΑ')).toBeDefined();
  });

  it('renders add node button', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByLabelText('Add node')).toBeDefined();
  });

  it('calls onAddClick when add button is clicked', () => {
    const onAddClick = vi.fn();
    render(<TopBar {...defaultProps} onAddClick={onAddClick} />);
    fireEvent.click(screen.getByLabelText('Add node'));
    expect(onAddClick).toHaveBeenCalledOnce();
  });

  it('renders search input', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByPlaceholderText('search...')).toBeDefined();
  });

  it('calls onSearchChange when search input value changes', () => {
    const onSearchChange = vi.fn();
    render(<TopBar {...defaultProps} onSearchChange={onSearchChange} />);
    fireEvent.change(screen.getByPlaceholderText('search...'), {
      target: { value: 'deliberate' },
    });
    expect(onSearchChange).toHaveBeenCalledWith('deliberate');
  });

  it('does not show clear button when search is empty', () => {
    render(<TopBar {...defaultProps} searchQuery="" />);
    expect(screen.queryByLabelText('clear search')).toBeNull();
  });

  it('shows clear button when search query is present', () => {
    render(<TopBar {...defaultProps} searchQuery="hello" />);
    expect(screen.getByLabelText('clear search')).toBeDefined();
  });

  it('calls onSearchChange("") when clear button is clicked', () => {
    const onSearchChange = vi.fn();
    render(<TopBar {...defaultProps} searchQuery="hello" onSearchChange={onSearchChange} />);
    fireEvent.click(screen.getByLabelText('clear search'));
    expect(onSearchChange).toHaveBeenCalledWith('');
  });

  it('calls onViewModeChange("canvas") when Canvas view button clicked', () => {
    const onViewModeChange = vi.fn();
    render(<TopBar {...defaultProps} viewMode="list" onViewModeChange={onViewModeChange} />);
    fireEvent.click(screen.getByLabelText('Canvas view'));
    expect(onViewModeChange).toHaveBeenCalledWith('canvas');
  });

  it('calls onViewModeChange("list") when List view button clicked', () => {
    const onViewModeChange = vi.fn();
    render(<TopBar {...defaultProps} viewMode="canvas" onViewModeChange={onViewModeChange} />);
    fireEvent.click(screen.getByLabelText('List view'));
    expect(onViewModeChange).toHaveBeenCalledWith('list');
  });

  it('renders stats with node count', () => {
    render(<TopBar {...defaultProps} />);
    expect(screen.getByText(`${EXAMPLE_NODES.length} nodes`)).toBeDefined();
  });

  it('renders stats with connection count', () => {
    render(<TopBar {...defaultProps} connectionCount={6} />);
    expect(screen.getByText('6 links')).toBeDefined();
  });
});
