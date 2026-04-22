import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Node as PhilosNode } from '@/types';

// ── Mock Supabase so createClient never runs with undefined credentials ──────
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn().mockResolvedValue({ data: [], error: { message: 'mock' } }),
      })),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
      delete: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  },
}));

// ── Mock Canvas (avoids HTMLCanvasElement / requestAnimationFrame in jsdom) ──
vi.mock('@/components/Canvas', () => ({
  default: ({
    nodes,
    onNodeSelect,
  }: {
    nodes: PhilosNode[];
    onNodeSelect: (id: string | null) => void;
  }) => (
    <div data-testid="canvas">
      {nodes.map((n) => (
        <button
          key={n.id}
          data-testid={`node-${n.id}`}
          onClick={() => onNodeSelect(n.id)}
        >
          {n.label}
        </button>
      ))}
    </div>
  ),
}));

// ── Lazy import after mock is registered ──────────────────────────────────────
import Home from '@/app/page';

describe('Integration — workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  // ── 1. Initial load ─────────────────────────────────────────────────────────
  it('loads EXAMPLE_STATE when localStorage is empty', async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText('Live deliberately')).toBeDefined();
    });
  });

  it('renders all example nodes on the canvas', async () => {
    render(<Home />);
    await waitFor(() =>
      expect(screen.getByTestId('node-form-1')).toBeDefined()
    );
    expect(screen.getByTestId('node-shadow-1')).toBeDefined();
  });

  // ── 2. View toggle ──────────────────────────────────────────────────────────
  it('switches to list view showing all nodes', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());
    fireEvent.click(screen.getByLabelText('List view'));
    await waitFor(() =>
      expect(screen.queryByTestId('canvas')).toBeNull()
    );
    expect(screen.getByText('Live deliberately')).toBeDefined();
    expect(screen.getByText('Financial freedom')).toBeDefined();
  });

  it('switches back to canvas view from list', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());
    fireEvent.click(screen.getByLabelText('List view'));
    await waitFor(() => expect(screen.queryByTestId('canvas')).toBeNull());
    fireEvent.click(screen.getByLabelText('Canvas view'));
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());
  });

  // ── 3. Search ───────────────────────────────────────────────────────────────
  it('filters nodes in list view by search query', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());
    fireEvent.click(screen.getByLabelText('List view'));

    fireEvent.change(screen.getByPlaceholderText('search...'), {
      target: { value: 'deliberately' },
    });

    await waitFor(() =>
      expect(screen.getByText('Live deliberately')).toBeDefined()
    );
    expect(screen.queryByText('Financial freedom')).toBeNull();
  });

  it('clearing search restores all nodes in list view', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());
    fireEvent.click(screen.getByLabelText('List view'));

    fireEvent.change(screen.getByPlaceholderText('search...'), {
      target: { value: 'deliberately' },
    });
    await waitFor(() =>
      expect(screen.queryByText('Financial freedom')).toBeNull()
    );

    fireEvent.click(screen.getByLabelText('clear search'));
    await waitFor(() =>
      expect(screen.getByText('Financial freedom')).toBeDefined()
    );
  });

  // ── 4. Add node ─────────────────────────────────────────────────────────────
  it('adds a new node which appears on the canvas', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());

    // Desktop + mobile FAB both carry aria-label="Add node"
    fireEvent.click(screen.getAllByLabelText('Add node')[0]);

    // Both mobile and desktop inputs share the same placeholder
    const input = screen.getAllByPlaceholderText('New thought...')[0];
    fireEvent.change(input, { target: { value: 'Integration test node' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() =>
      expect(screen.getAllByText('Integration test node').length).toBeGreaterThan(0)
    );
  });

  it('new node is visible in list view after adding', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());

    fireEvent.click(screen.getAllByLabelText('Add node')[0]);
    const input = screen.getAllByPlaceholderText('New thought...')[0];
    fireEvent.change(input, { target: { value: 'My new idea' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    fireEvent.click(screen.getByLabelText('List view'));
    await waitFor(() =>
      expect(screen.getByText('My new idea')).toBeDefined()
    );
  });

  // ── 5. Delete node ──────────────────────────────────────────────────────────
  it('deletes a node — it disappears from the canvas', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('node-shadow-1')).toBeDefined());

    // Select the node via the mock Canvas button
    fireEvent.click(screen.getByTestId('node-shadow-1'));

    // DetailPanel should appear; click "Delete node"
    await waitFor(() =>
      expect(screen.getAllByText('Delete node').length).toBeGreaterThan(0)
    );
    fireEvent.click(screen.getAllByText('Delete node')[0]);

    // Confirm deletion in the DeleteConfirm dialog
    await waitFor(() =>
      expect(screen.getByText('Delete')).toBeDefined()
    );
    fireEvent.click(screen.getByText('Delete'));

    // Node button is gone from canvas
    await waitFor(() =>
      expect(screen.queryByTestId('node-shadow-1')).toBeNull()
    );
  });

  // ── 6. localStorage persistence ─────────────────────────────────────────────
  it('persists state to localStorage after adding a node', async () => {
    render(<Home />);
    await waitFor(() => expect(screen.getByTestId('canvas')).toBeDefined());

    fireEvent.click(screen.getAllByLabelText('Add node')[0]);
    const input = screen.getAllByPlaceholderText('New thought...')[0];
    fireEvent.change(input, { target: { value: 'Persisted idea' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => {
      const raw = localStorage.getItem('philosophy-os:v1');
      expect(raw).not.toBeNull();
      const parsed = JSON.parse(raw!);
      expect(
        parsed.nodes.some((n: PhilosNode) => n.label === 'Persisted idea')
      ).toBe(true);
    });
  });
});
