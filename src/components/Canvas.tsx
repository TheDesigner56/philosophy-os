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

const TOUCH_HIT_BONUS = 12;

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
  const animPhaseRef = useRef(0);

  // Touch tracking
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const touchNodeIdRef = useRef<string | null>(null);
  const lastTapRef = useRef<{ time: number; id: string } | null>(null);

  const getNodeAt = useCallback(
    (x: number, y: number, bonus = 0): Node | null => {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const r = CATEGORIES[n.category].radius + bonus;
        const dx = x - n.x;
        const dy = y - n.y;
        if (dx * dx + dy * dy <= r * r) return n;
      }
      return null;
    },
    [nodes]
  );

  const draw = useCallback(
    (phase: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const W = canvas.width;
      const H = canvas.height;
      const now = Date.now();

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

        // Fade-in animation: parse timestamp from id format `fromId__toId__timestamp`
        const parts = conn.id.split('__');
        const createdAt = parseInt(parts[parts.length - 1]) || 0;
        const connAge = now - createdAt;
        const connAlpha = createdAt > 0 ? Math.min(1, connAge / 700) : 1;

        const sq = searchQuery.toLowerCase();
        const highlighted =
          !sq ||
          from.label.toLowerCase().includes(sq) ||
          to.label.toLowerCase().includes(sq);

        ctx.beginPath();
        const baseAlpha = highlighted ? 0.14 : 0.04;
        ctx.strokeStyle = `rgba(255,255,255,${baseAlpha * connAlpha})`;
        ctx.lineWidth = highlighted ? 1.5 : 1;
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

        // Entrance fade-in for newly created nodes
        const nodeAge = now - node.createdAt;
        const enterAlpha = nodeAge < 500 ? nodeAge / 500 : 1;
        const searchAlpha = sq && !matchesSearch ? 0.12 : 1;

        ctx.globalAlpha = enterAlpha * searchAlpha;

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

        // Selection ring — pulses gently
        if (isSelected) {
          const pulse = 0.5 + 0.5 * Math.sin(phase * Math.PI * 2);
          const ringR = cfg.radius + 5 + pulse * 3;
          const ringAlpha = 0.35 + pulse * 0.25;
          ctx.beginPath();
          ctx.arc(node.x, node.y, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${ringAlpha})`;
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

        // Node circle — scale-in entrance
        const scale = nodeAge < 500 ? 0.4 + 0.6 * (nodeAge / 500) : 1;
        if (scale < 1) {
          ctx.save();
          ctx.translate(node.x, node.y);
          ctx.scale(scale, scale);
          ctx.translate(-node.x, -node.y);
        }

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

        if (scale < 1) ctx.restore();

        ctx.globalAlpha = 1;
      }
    },
    [nodes, connections, selectedNodeId, searchQuery, pendingConnectionFrom]
  );

  // Continuous animation loop
  useEffect(() => {
    let lastTime = 0;
    const loop = (time: number) => {
      const dt = lastTime ? time - lastTime : 16;
      lastTime = time;
      animPhaseRef.current = (animPhaseRef.current + dt * 0.0008) % 1;
      draw(animPhaseRef.current);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw(animPhaseRef.current);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  // ── Mouse helpers ──────────────────────────────────────────────────────────

  const getMousePos = (e: React.MouseEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getMousePos(e);
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
    const { x, y } = getMousePos(e);
    onNodeMove(
      draggingRef.current.id,
      x - draggingRef.current.offsetX,
      y - draggingRef.current.offsetY
    );
  };

  const handleMouseUp = () => { draggingRef.current = null; };

  // ── Touch helpers ──────────────────────────────────────────────────────────

  const getTouchPos = (touch: React.Touch) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (touch.clientX - rect.left) * (canvas.width / rect.width),
      y: (touch.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) { clearLongPress(); return; }
    const touch = e.touches[0];
    const pos = getTouchPos(touch);
    touchStartPosRef.current = pos;

    const node = getNodeAt(pos.x, pos.y, TOUCH_HIT_BONUS);
    if (!node) {
      onNodeSelect(null);
      touchNodeIdRef.current = null;
      return;
    }

    onNodeSelect(node.id);
    touchNodeIdRef.current = node.id;

    // Double-tap detection: second tap on same node within 300ms opens detail
    const now = Date.now();
    if (lastTapRef.current?.id === node.id && now - lastTapRef.current.time < 300) {
      lastTapRef.current = null;
      // node is already selected, detail panel shows automatically
      return;
    }
    lastTapRef.current = { time: now, id: node.id };

    // Long-press (450ms) starts drag
    const capturedPos = pos;
    longPressTimerRef.current = setTimeout(() => {
      longPressTimerRef.current = null;
      if (!touchNodeIdRef.current) return;
      const n = nodes.find((nd) => nd.id === touchNodeIdRef.current);
      if (!n) return;
      draggingRef.current = {
        id: n.id,
        offsetX: capturedPos.x - n.x,
        offsetY: capturedPos.y - n.y,
      };
    }, 450);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const pos = getTouchPos(touch);

    // Cancel long press if finger moved significantly before timer fires
    if (longPressTimerRef.current && touchStartPosRef.current) {
      const dx = pos.x - touchStartPosRef.current.x;
      const dy = pos.y - touchStartPosRef.current.y;
      if (Math.sqrt(dx * dx + dy * dy) > 10) {
        clearLongPress();
      }
    }

    if (!draggingRef.current) return;
    e.preventDefault();
    onNodeMove(
      draggingRef.current.id,
      pos.x - draggingRef.current.offsetX,
      pos.y - draggingRef.current.offsetY
    );
  };

  const handleTouchEnd = () => {
    clearLongPress();
    draggingRef.current = null;
    touchNodeIdRef.current = null;
    touchStartPosRef.current = null;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair touch-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    />
  );
}
