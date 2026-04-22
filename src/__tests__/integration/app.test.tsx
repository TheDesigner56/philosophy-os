import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Node, Connection } from '@/types';

// Mock Canvas — jsdom has no 2D canvas context
vi.mock('@/components/Canvas', () => ({
  default: ({
    nodes,
    connections,
    onNodeSelect,
    onConnect,
  }: {
    nodes: Node[];
    connections: Connection[];
    selectedNodeId: string | null;
    searchQuery: string;
    pendingConnectionFrom: string | null;
    onNodeSelect: (id: string) => void;
    onNodeMove: (id: string, x: number, y: number) => void;
    onConnect: (from: string, to: string) => void;
  }) => (
    <div data-testid="canvas">
      {nodes.map((n) => (
        <div
          key={n.id}
          data-testid={`node-${n.id}`}
          data-label={n.label}
          onClick={() => onNodeSelect(n.id)}
        >
          {n.label}
        </div>
      ))}
      <span data-testid="canvas-node-count">{nodes.length}</span>
      <span data-testid="canvas-connection-count">{connections.length}</span>
      {nodes.length >= 2 && (
        <button
          data-testid="connect-first-two"
          onClick={() => onConnect(nodes[0].id, nodes[1].id)}
        >
          Connect first two
        </button>
      )}
    </div>
  ),
}));

// Vitest 4 jsdom may not expose a fully functional localStorage —
// replace it with a robust in-memory implementation for every test.
function makeLocalStorageMock() {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = String(value); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
}

// Lazy import after mock is registered
async function renderHome() {
  const { default: Home } = await import('@/app/page');
  return render(<Home />);
}

beforeEach(() => {
  vi.stubGlobal('localStorage', makeLocalStorageMock());
  vi.resetModules();
});

describe('App integration', () => {
  it('loads example state when localStorage is empty', async () => {
    await renderHome();
    // After hydration the canvas should contain example nodes
    await waitFor(() => {
      expect(screen.getByTestId('canvas')).toBeInTheDocument();
    });
    // EXAMPLE_STATE has 8 nodes
    const count = Number(screen.getByTestId('canvas-node-count').textContent);
    expect(count).toBeGreaterThan(0);
  });

  it('restores persisted state from localStorage', async () => {
    const state = {
      nodes: [
        { id: 'saved-1', category: 'thought', label: 'Saved node', notes: '', x: 100, y: 100, createdAt: 1 },
      ],
      connections: [],
    };
    localStorage.setItem('philosophy-os:v1', JSON.stringify(state));

    await renderHome();
    await waitFor(() => {
      expect(screen.getByText('Saved node')).toBeInTheDocument();
    });
  });

  it('add node → node appears on canvas', async () => {
    const user = userEvent.setup();
    await renderHome();

    await waitFor(() => expect(screen.getByTestId('canvas')).toBeInTheDocument());
    const initialCount = Number(screen.getByTestId('canvas-node-count').textContent);

    // Open AddPanel via + button in TopBar
    await user.click(screen.getByTitle('Add node (+)'));
    const addInput = screen.getByPlaceholderText('New thought...');
    expect(addInput).toBeInTheDocument();

    // Type label and submit
    await user.type(addInput, 'Brand new idea{Enter}');

    await waitFor(() => {
      const newCount = Number(screen.getByTestId('canvas-node-count').textContent);
      expect(newCount).toBe(initialCount + 1);
    });
    // node appears in canvas mock (DetailPanel also opens, hence getAllByText)
    expect(screen.getAllByText('Brand new idea').length).toBeGreaterThan(0);
  });

  it('delete node → removed from canvas and connections cleaned', async () => {
    const user = userEvent.setup();
    // Use a node that has a known connection
    const state = {
      nodes: [
        { id: 'a', category: 'thought', label: 'Node A', notes: '', x: 100, y: 100, createdAt: 1 },
        { id: 'b', category: 'goal', label: 'Node B', notes: '', x: 200, y: 200, createdAt: 2 },
      ],
      connections: [{ id: 'a__b__0', from: 'a', to: 'b' }],
    };
    localStorage.setItem('philosophy-os:v1', JSON.stringify(state));

    await renderHome();
    await waitFor(() => expect(screen.getByText('Node A')).toBeInTheDocument());

    // Click node A to open DetailPanel
    await user.click(screen.getByTestId('node-a'));
    await waitFor(() => expect(screen.getByText('Delete node')).toBeInTheDocument());

    // Delete node A
    await user.click(screen.getByText('Delete node'));

    await waitFor(() => {
      expect(screen.queryByText('Node A')).not.toBeInTheDocument();
    });

    // Connection count should drop to 0
    await waitFor(() => {
      const connCount = Number(screen.getByTestId('canvas-connection-count').textContent);
      expect(connCount).toBe(0);
    });
  });

  it('connect nodes → connection count increases', async () => {
    const user = userEvent.setup();
    const state = {
      nodes: [
        { id: 'x', category: 'thought', label: 'X', notes: '', x: 100, y: 100, createdAt: 1 },
        { id: 'y', category: 'goal', label: 'Y', notes: '', x: 200, y: 200, createdAt: 2 },
      ],
      connections: [],
    };
    localStorage.setItem('philosophy-os:v1', JSON.stringify(state));

    await renderHome();
    await waitFor(() => expect(screen.getByTestId('connect-first-two')).toBeInTheDocument());

    const before = Number(screen.getByTestId('canvas-connection-count').textContent);
    await user.click(screen.getByTestId('connect-first-two'));

    await waitFor(() => {
      const after = Number(screen.getByTestId('canvas-connection-count').textContent);
      expect(after).toBe(before + 1);
    });
  });

  it('duplicate connection is rejected (dedup)', async () => {
    const user = userEvent.setup();
    const state = {
      nodes: [
        { id: 'x', category: 'thought', label: 'X', notes: '', x: 100, y: 100, createdAt: 1 },
        { id: 'y', category: 'goal', label: 'Y', notes: '', x: 200, y: 200, createdAt: 2 },
      ],
      connections: [{ id: 'x__y__0', from: 'x', to: 'y' }],
    };
    localStorage.setItem('philosophy-os:v1', JSON.stringify(state));

    await renderHome();
    await waitFor(() => expect(screen.getByTestId('connect-first-two')).toBeInTheDocument());

    const before = Number(screen.getByTestId('canvas-connection-count').textContent);
    await user.click(screen.getByTestId('connect-first-two'));

    // Count should remain unchanged
    await waitFor(() => {
      const after = Number(screen.getByTestId('canvas-connection-count').textContent);
      expect(after).toBe(before);
    });
  });

  it('search filters — switching to list view shows only matching nodes', async () => {
    const user = userEvent.setup();
    await renderHome();
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeInTheDocument());

    // Switch to list view
    await user.click(screen.getByText('List'));

    // Type search query that matches one example node
    await user.type(screen.getByPlaceholderText('search...'), 'financial');

    await waitFor(() => {
      expect(screen.getByText('Financial freedom')).toBeInTheDocument();
      expect(screen.queryByText('Live deliberately')).not.toBeInTheDocument();
    });
  });

  it('AddPanel closes on Escape key', async () => {
    const user = userEvent.setup();
    await renderHome();
    await waitFor(() => expect(screen.getByTitle('Add node (+)')).toBeInTheDocument());

    await user.click(screen.getByTitle('Add node (+)'));
    const addInput = screen.getByPlaceholderText('New thought...');
    expect(addInput).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(screen.queryByPlaceholderText('New thought...')).not.toBeInTheDocument();
    });
  });

  it('DetailPanel shows connected node info', async () => {
    const user = userEvent.setup();
    const state = {
      nodes: [
        { id: 'p', category: 'form', label: 'Parent', notes: '', x: 100, y: 100, createdAt: 1 },
        { id: 'c', category: 'thought', label: 'Child', notes: '', x: 200, y: 200, createdAt: 2 },
      ],
      connections: [{ id: 'p__c__0', from: 'p', to: 'c' }],
    };
    localStorage.setItem('philosophy-os:v1', JSON.stringify(state));

    await renderHome();
    await waitFor(() => expect(screen.getByText('Parent')).toBeInTheDocument());

    await user.click(screen.getByTestId('node-p'));
    await waitFor(() => {
      // DetailPanel header shows the node label
      const panel = screen.getByText('Delete node').closest('div[class*="absolute"]') as HTMLElement;
      expect(within(panel).getByText('Child')).toBeInTheDocument();
    });
  });
});
