import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListView from '@/components/ListView';
import type { Node, Connection } from '@/types';
import { EXAMPLE_NODES, EXAMPLE_CONNECTIONS } from '@/data/examples';

const onSelect = vi.fn();

describe('ListView', () => {
  it('renders all nodes when no search query', () => {
    render(
      <ListView
        nodes={EXAMPLE_NODES}
        connections={EXAMPLE_CONNECTIONS}
        searchQuery=""
        onSelect={onSelect}
      />,
    );
    for (const n of EXAMPLE_NODES) {
      expect(screen.getByText(n.label)).toBeInTheDocument();
    }
  });

  it('groups nodes by category with section headings', () => {
    render(
      <ListView
        nodes={EXAMPLE_NODES}
        connections={EXAMPLE_CONNECTIONS}
        searchQuery=""
        onSelect={onSelect}
      />,
    );
    // Form and Goal sections should be visible (example data has both)
    expect(screen.getByText('Form')).toBeInTheDocument();
    expect(screen.getByText('Goal')).toBeInTheDocument();
  });

  it('filters nodes by search query (label match)', () => {
    render(
      <ListView
        nodes={EXAMPLE_NODES}
        connections={EXAMPLE_CONNECTIONS}
        searchQuery="financial"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText('Financial freedom')).toBeInTheDocument();
    expect(screen.queryByText('Live deliberately')).not.toBeInTheDocument();
  });

  it('filters nodes by notes content', () => {
    render(
      <ListView
        nodes={EXAMPLE_NODES}
        connections={EXAMPLE_CONNECTIONS}
        searchQuery="non-renewable"
        onSelect={onSelect}
      />,
    );
    // 'Protect my time' has notes: 'Time is the only non-renewable resource.'
    expect(screen.getByText('Protect my time')).toBeInTheDocument();
  });

  it('shows empty state when no results', () => {
    render(
      <ListView
        nodes={EXAMPLE_NODES}
        connections={EXAMPLE_CONNECTIONS}
        searchQuery="zzznomatch"
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText(/No matches for/)).toBeInTheDocument();
  });

  it('shows empty state message when no nodes at all', () => {
    render(
      <ListView
        nodes={[]}
        connections={[]}
        searchQuery=""
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText(/No nodes yet/)).toBeInTheDocument();
  });

  it('calls onSelect with node id when node clicked', async () => {
    const user = userEvent.setup();
    const onSelectMock = vi.fn();
    render(
      <ListView
        nodes={EXAMPLE_NODES}
        connections={EXAMPLE_CONNECTIONS}
        searchQuery=""
        onSelect={onSelectMock}
      />,
    );
    await user.click(screen.getByText('Live deliberately'));
    expect(onSelectMock).toHaveBeenCalledWith('form-1');
  });

  it('shows link count for connected nodes', () => {
    const nodes: Node[] = [
      { id: 'a', category: 'thought', label: 'Alpha', notes: '', x: 0, y: 0, createdAt: 1 },
      { id: 'b', category: 'thought', label: 'Beta', notes: '', x: 0, y: 0, createdAt: 2 },
    ];
    const connections: Connection[] = [{ id: 'a__b__0', from: 'a', to: 'b' }];
    render(
      <ListView nodes={nodes} connections={connections} searchQuery="" onSelect={vi.fn()} />,
    );
    // Both nodes have 1 link
    expect(screen.getAllByText('1 link')).toHaveLength(2);
  });

  it('does not show link text for nodes with no connections', () => {
    const nodes: Node[] = [
      { id: 'a', category: 'thought', label: 'Solo', notes: '', x: 0, y: 0, createdAt: 1 },
    ];
    render(<ListView nodes={nodes} connections={[]} searchQuery="" onSelect={vi.fn()} />);
    expect(screen.queryByText(/link/)).not.toBeInTheDocument();
  });
});
