import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DetailPanel from '@/components/DetailPanel';
import type { Node, Connection } from '@/types';

const baseNode: Node = {
  id: 'n1',
  category: 'thought',
  label: 'Test thought',
  notes: 'Some notes here',
  x: 100,
  y: 200,
  createdAt: new Date('2024-01-15').getTime(),
};

const connectedNode: Node = {
  id: 'n2',
  category: 'goal',
  label: 'Connected goal',
  notes: '',
  x: 200,
  y: 300,
  createdAt: new Date('2024-02-01').getTime(),
};

const connection: Connection = { id: 'n1__n2__0', from: 'n1', to: 'n2' };

describe('DetailPanel', () => {
  const onUpdate = vi.fn();
  const onDelete = vi.fn();
  const onClose = vi.fn();
  const onNavigate = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it('shows node label', () => {
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    expect(screen.getByText('Test thought')).toBeInTheDocument();
  });

  it('shows category name', () => {
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    // 'Thought' appears in the header span and in the category <select> options
    expect(screen.getAllByText('Thought').length).toBeGreaterThan(0);
  });

  it('shows node notes in textarea', () => {
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    expect(screen.getByDisplayValue('Some notes here')).toBeInTheDocument();
  });

  it('calls onClose when × button clicked', async () => {
    const user = userEvent.setup();
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    await user.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onDelete when delete button clicked', async () => {
    const user = userEvent.setup();
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    await user.click(screen.getByText('Delete node'));
    expect(onDelete).toHaveBeenCalledWith('n1');
  });

  it('calls onUpdate when label input changes', async () => {
    const user = userEvent.setup();
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    const titleInput = screen.getByDisplayValue('Test thought');
    await user.type(titleInput, 'X');
    expect(onUpdate).toHaveBeenCalledWith('n1', expect.objectContaining({ label: expect.any(String) }));
  });

  it('shows connected nodes section when connections exist', () => {
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode, connectedNode]}
        connections={[connection]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    expect(screen.getByText('Connected goal')).toBeInTheDocument();
    expect(screen.getByText(/Connections/)).toBeInTheDocument();
  });

  it('does not show connections section when no connections', () => {
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode]}
        connections={[]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    expect(screen.queryByText(/Connections \(/)).not.toBeInTheDocument();
  });

  it('calls onNavigate when connected node button clicked', async () => {
    const user = userEvent.setup();
    render(
      <DetailPanel
        node={baseNode}
        allNodes={[baseNode, connectedNode]}
        connections={[connection]}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onClose={onClose}
        onNavigate={onNavigate}
      />,
    );
    await user.click(screen.getByText('Connected goal'));
    expect(onNavigate).toHaveBeenCalledWith('n2');
  });
});
