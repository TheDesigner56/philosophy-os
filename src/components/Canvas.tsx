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
}

export default function Canvas({
  nodes,
  connections,
  selectedNodeId,
  searchQuery,
  pendingConnectionFrom,
  onNodeSelect,
  onNodeMove,
  onConnect,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const draggingRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const animRef = useRef<number>(0);

  const getNodeAt = useCallback(
    (x: number, y: number): Node | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const r = CATEGORIES[n.category].radius;
        const dx = x - n.x;
        const dy = y - n.y;
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    },
    [nodes]
  );

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;

    ctx.fillStyle = '#0A0A0A';
    ctx.fillRect(0, 0, W, H);

    // Subtle grid
    ctx.strokeStyle = 'rgba(255,255,255,0.025)';
    ctx.lineWidth = 1;
    const gs = 40;
    for (let x = 0; x < W; x += gs) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Connections
    for (const conn of connections) {
      const from = nodes.find((n) => n.id === conn.from);
      const to = nodes.find((n) => n.id === conn.to);
      if (!from || !to) continue;

      const sq = searchQuery.toLowerCase();
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

    // Nodes
    for (const node of nodes) {
      const cfg = CATEGORIES[node.category];
      const isSelected = node.id === selectedNodeId;
      const isPending = node.id === pendingConnectionFrom;
      const sq = searchQuery.toLowerCase();
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

      // Selection ring
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, cfg.radius + 7, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Pending dashed ring
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
      const fontSize = Math.max(8, Math.min(11, cfg.radius * 0.42));
      ctx.font = `500 ${fontSize}px Inter, system-ui, sans-serif`;
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
  }, [nodes, connections, selectedNodeId, searchQuery, pendingConnectionFrom]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  useEffect(() => {
    cancelAnimationFrame(animRef.current);
    animRef.current = requestAnimationFrame(draw);
  }, [draw]);

  const getPos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getPos(e);
    const node = getNodeAt(x, y);

    if (!node) { onNodeSelect(null); return; }

    if (e.shiftKey) {
      if (pendingConnectionFrom && pendingConnectionFrom !== node.id) {
        onConnect(pendingConnectionFrom, node.id);
      } else {
        onNodeSelect(node.id);
      }
      return;
    }

    draggingRef.current = { id: node.id, offsetX: x - node.x, offsetY: y - node.y };
    onNodeSelect(node.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current) return;
    const { x, y } = getPos(e);
    onNodeMove(
      draggingRef.current.id,
      x - draggingRef.current.offsetX,
      y - draggingRef.current.offsetY
    );
  };

  const handleMouseUp = () => { draggingRef.current = null; };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    />
  );
}
