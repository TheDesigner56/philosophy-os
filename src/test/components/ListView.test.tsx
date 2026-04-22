import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ListView from '@/components/ListView';
import { EXAMPLE_NODES, EXAMPLE_CONNECTIONS } from '@/data/examples';

const defaultProps = {
  nodes: EXAMPLE_NODES,
  connections: EXAMPLE_CONNECTIONS,
  searchQuery: '',
  onSelect: vi.fn(),
};

describe('ListView', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders all example node labels', () => {
    render(<ListView {...defaultProps} />);
    for (const node of EXAMPLE_NODES) {
      expect(screen.getByText(node.label)).toBeDefined();
    }
  });

  it('renders category section headers', () => {
    render(<ListView {...defaultProps} />);
    expect(screen.getByText('Form')).toBeDefined();
    expect(screen.getByText('Goal')).toBeDefined();
    expect(screen.getByText('Problem')).toBeDefined();
    expect(screen.getByText('Thought')).toBeDefined();
    expect(screen.getByText('Shadow')).toBeDefined();
  });

  it('filters nodes by search query matching label', () => {
    render(<ListView {...defaultProps} searchQuery="deliberately" />);
    expect(screen.getByText('Live deliberately')).toBeDefined();
    expect(screen.queryByText('Financial freedom')).toBeNull();
  });

  it('filters nodes by search query matching notes', () => {
    // "Master my craft" → notes: "Deep expertise compounds over time."
    render(<ListView {...defaultProps} searchQuery="compound" />);
    expect(screen.getByText('Master my craft')).toBeDefined();
  });

  it('search is case-insensitive', () => {
    render(<ListView {...defaultProps} searchQuery="DELIBERATELY" />);
    expect(screen.getByText('Live deliberately')).toBeDefined();
  });

  it('shows no-match message when search yields nothing', () => {
    render(<ListView {...defaultProps} searchQuery="xyznotfound" />);
    expect(screen.getByText(/No matches for/)).toBeDefined();
  });

  it('shows empty state message when there are no nodes', () => {
    render(<ListView {...defaultProps} nodes={[]} />);
    expect(screen.getByText(/No nodes yet/)).toBeDefined();
  });

  it('calls onSelect with the node id when a node row is clicked', () => {
    const onSelect = vi.fn();
    render(<ListView {...defaultProps} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('Live deliberately'));
    expect(onSelect).toHaveBeenCalledWith('form-1');
  });

  it('shows link count for connected nodes', () => {
    render(<ListView {...defaultProps} />);
    // form-1 has 2 connections (goal-1 and form-2)
    expect(screen.getAllByText('2 links').length).toBeGreaterThanOrEqual(1);
  });

  it('shows singular "1 link" label when exactly one connection', () => {
    render(<ListView {...defaultProps} />);
    expect(screen.getAllByText('1 link').length).toBeGreaterThanOrEqual(1);
  });

  it('does not render hidden category sections', () => {
    // With only form nodes, Goal/Problem sections should not render
    const formOnly = EXAMPLE_NODES.filter((n) => n.category === 'form');
    render(<ListView {...defaultProps} nodes={formOnly} />);
    expect(screen.queryByText('Goal')).toBeNull();
    expect(screen.queryByText('Problem')).toBeNull();
  });
});
