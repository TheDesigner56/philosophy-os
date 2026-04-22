'use client';

import { useRef, useEffect, useCallback } from 'react';
import { Node, Connection, CATEGORIES } from '@/types';

interface CanvasProps {
  nodes: Node[];
  connections: Connection[];
  selectedNodeId: string | null;
  searchQuery: string;
  pendingConnectionFrom: string | null;
  onNodeSelect: (id: string | null) => void;
  onNodeMove: (id: string, x: number, y: number) => void;
  onConnect: (fromId: string, toId: string) => void;
  /** Called when a user long-presses a node on touch to enter connect mode. */
  onRequestConnect?: (id: string) => void;
}

const LONG_PRESS_MS = 500;
const LONG_PRESS_MOVE_TOLERANCE = 6;

export default function Canvas({
  nodes,
  connections,
  selectedNodeId,
  searchQuery,
  pendingConnectionFrom,
  onNodeSelect,
  onNodeMove,
  onConnect,
  onRequestConnect,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef<{
    id: string;
    offsetX: number;
    offsetY: number;
    startX: number;
    startY: number;
    moved: boolean;
    pointerId: number;
  } | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const animRef = useRef<number>(0);

  // Keep latest state in refs for the continuous anim loop (avoids rAF thrashing).
  const stateRef = useRef({
    nodes,
    connections,
    selectedNodeId,
    searchQuery,
    pendingConnectionFrom,
  });
  stateRef.current = {
    nodes,
    connections,
    selectedNodeId,
    searchQuery,
    pendingConnectionFrom,
  };

  const getNodeAt = useCallback(
    (x: number, y: number, nodeList: Node[]): Node | null => {
      for (let i = nodeList.length - 1; i >= 0; i--) {
        const n = nodeList[i];
        const r = CATEGORIES[n.category].radius;
        const dx = x - n.x;
        const dy = y - n.y;
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    },
    []
  );

  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth;
    const cssH = canvas.clientHeight;

    const { nodes, connections, selectedNodeId, searchQuery, pendingConnectionFrom } =
      stateRef.current;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, cssW, cssH);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const gs = 40;
    for (let x = 0; x < cssW; x += gs) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssH);
      ctx.stroke();
    }
    for (let y = 0; y < cssH; y += gs) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(cssW, y);
      ctx.stroke();
    }

    const sq = searchQuery.toLowerCase();

    // Connections
    for (const conn of connections) {
      const from = nodes.find((n) => n.id === conn.from);
      const to = nodes.find((n) => n.id === conn.to);
      if (!from || !to) continue;

      const highlighted =
        !sq ||
        from.label.toLowerCase().includes(sq) ||
        to.label.toLowerCase().includes(sq);

      ctx.beginPath();
      ctx.strokeStyle = highlighted ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      const mx = (from.x + to.x) / 2;
      const my = (from.y + to.y) / 2 - 22;
      ctx.moveTo(from.x, from.y);
      ctx.quadraticCurveTo(mx, my, to.x, to.y);
      ctx.stroke();
    }

    // Pulse amplitude [0..1], sine-based, ~1.6s period
    const pulse = 0.5 + 0.5 * Math.sin((timestamp / 1000) * (Math.PI / 0.8));

    // Nodes
    for (const node of nodes) {
      const cfg = CATEGORIES[node.category];
      const isSelected = node.id === selectedNodeId;
      const isPending = node.id === pendingConnectionFrom;
      const matchesSearch = !sq || node.label.toLowerCase().includes(sq);

      ctx.globalAlpha = sq && !matchesSearch ? 0.12 : 1;

      // Form glow
      if (cfg.glow) {
        const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, cfg.radius * 2.8);
        grad.addColorStop(0, 'rgba(255,255,255,0.14)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath();
        ctx.arc(node.x, node.y, cfg.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Selection ring + gentle pulse
      if (isSelected) {
        const ringAlpha = 0.35 + 0.35 * pulse;
        const ringOffset = 7 + 3 * pulse;
        ctx.beginPath();
        ctx.arc(node.x, node.y, cfg.radius + ringOffset, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${ringAlpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Outer halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, cfg.radius + ringOffset + 6 + 4 * pulse, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,255,255,${(0.08 + 0.1 * pulse).toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Pending dashed ring (connect mode source)
      if (isPending && !isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, cfg.radius + 12, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, cfg.radius, 0, Math.PI * 2);
      ctx.fillStyle = cfg.fill;
      ctx.fill();

      ctx.strokeStyle = cfg.stroke;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const fontSize = Math.max(9, Math.min(12, cfg.radius * 0.42));
      ctx.font = `500 ${fontSize}px Inter, -apple-system, system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = cfg.text;

      const maxW = cfg.radius * 1.55;
      const words = node.label.split(' ');
      if (words.length > 1 && ctx.measureText(node.label).width > maxW) {
        const mid = Math.ceil(words.length / 2);
        ctx.fillText(words.slice(0, mid).join(' '), node.x, node.y - fontSize * 0.65);
        ctx.fillText(words.slice(mid).join(' '), node.x, node.y + fontSize * 0.65);
      } else {
        ctx.fillText(node.label, node.x, node.y);
      }

      ctx.globalAlpha = 1;
    }

    animRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    animRef.current = requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  const getPos = (e: React.PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current != null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    const { x, y } = getPos(e);
    const node = getNodeAt(x, y, nodes);

    if (!node) {
      onNodeSelect(null);
      return;
    }

    // Shift+click for desktop connect
    if (e.shiftKey) {
      if (pendingConnectionFrom && pendingConnectionFrom !== node.id) {
        onConnect(pendingConnectionFrom, node.id);
      } else {
        onNodeSelect(node.id);
      }
      return;
    }

    // Pending connection source exists (from long-press or keyboard 'c') — click another node to connect
    if (pendingConnectionFrom && pendingConnectionFrom !== node.id) {
      onConnect(pendingConnectionFrom, node.id);
      return;
    }

    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    draggingRef.current = {
      id: node.id,
      offsetX: x - node.x,
      offsetY: y - node.y,
      startX: x,
      startY: y,
      moved: false,
      pointerId: e.pointerId,
    };
    onNodeSelect(node.id);

    // Touch/pen long-press → connect mode
    if ((e.pointerType === 'touch' || e.pointerType === 'pen') && onRequestConnect) {
      clearLongPress();
      longPressTimerRef.current = window.setTimeout(() => {
        if (draggingRef.current && !draggingRef.current.moved) {
          onRequestConnect(node.id);
          draggingRef.current = null;
        }
      }, LONG_PRESS_MS);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const d = draggingRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const { x, y } = getPos(e);
    const dx = x - d.startX;
    const dy = y - d.startY;
    if (!d.moved && dx * dx + dy * dy > LONG_PRESS_MOVE_TOLERANCE * LONG_PRESS_MOVE_TOLERANCE) {
      d.moved = true;
      clearLongPress();
    }
    onNodeMove(d.id, x - d.offsetX, y - d.offsetY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    clearLongPress();
    if (draggingRef.current?.pointerId === e.pointerId) {
      draggingRef.current = null;
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerUp}
    />
  );
}
