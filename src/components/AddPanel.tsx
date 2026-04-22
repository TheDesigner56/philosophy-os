'use client';

import { useState, useRef, useEffect } from 'react';
import { Category, CATEGORIES, CATEGORY_ORDER } from '@/types';

interface AddPanelProps {
  onAdd: (category: Category, label: string) => void;
  onClose: () => void;
}

export default function AddPanel({ onAdd, onClose }: AddPanelProps) {
  const [category, setCategory] = useState<Category>('thought');
  const [label, setLabel] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // SpeechRecognition is not in all TS DOM lib configs — use unknown to avoid the missing type
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd(category, label.trim());
    setLabel('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onClose();
  };

  const toggleRecording = async () => {
    if (isRecording) {
      (recognitionRef.current as { stop: () => void } | null)?.stop();
      setIsRecording(false);
      return;
    }
    try {
      type RecognitionCtor = new () => {
        lang: string; interimResults: boolean;
        onresult: ((e: { results: { [n: number]: { [n: number]: { transcript: string } } } }) => void) | null;
        onend: (() => void) | null;
        start: () => void; stop: () => void;
      };
      const win = window as unknown as Record<string, RecognitionCtor | undefined>;
      const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
      if (!SR) { setIsRecording(true); setTimeout(() => setIsRecording(false), 2000); return; }
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.onresult = (e) => {
        const t = e.results[0][0].transcript;
        setLabel((prev) => (prev ? `${prev} ${t}` : t));
      };
      rec.onend = () => setIsRecording(false);
      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-30">
      <div className="bg-[#111111] border border-white/15 rounded-lg p-4 shadow-2xl">
        {/* Category pills */}
        <div className="flex gap-2 mb-3 flex-wrap">
          {CATEGORY_ORDER.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-[10px] tracking-[0.15em] uppercase px-3 py-1 rounded-full border transition-colors ${
                category === c
                  ? 'border-white/60 text-white/90 bg-white/5'
                  : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white/60'
              }`}
            >
              {CATEGORIES[c].name}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`New ${CATEGORIES[category].name.toLowerCase()}...`}
            className="flex-1 bg-transparent border border-white/15 text-white/90 text-sm px-3 py-2 rounded focus:outline-none focus:border-white/40 placeholder-white/20"
          />

          {/* Mic */}
          <button
            onClick={toggleRecording}
            title="Voice input"
            className={`w-9 h-9 rounded border flex items-center justify-center transition-colors shrink-0 ${
              isRecording
                ? 'border-red-500/70 bg-red-500/10 text-red-400'
                : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white/70'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>

          {/* Add */}
          <button
            onClick={handleAdd}
            disabled={!label.trim()}
            className="w-9 h-9 rounded border border-white/25 text-white/70 hover:border-white/50 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors shrink-0 text-lg leading-none"
          >
            +
          </button>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <span className="text-[10px] text-white/25">Enter to add · Esc to close · Shift+click to connect</span>
          <button onClick={onClose} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
            close
          </button>
        </div>
      </div>
    </div>
  );
}
