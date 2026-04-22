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
  const recognitionRef = useRef<unknown>(null);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 150);
    return () => clearTimeout(t);
  }, []);

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
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/50 backdrop-enter"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sheet-enter bg-[#111111] rounded-t-2xl border-t border-white/15 shadow-2xl pb-safe">
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        <div className="px-4 pt-1 pb-2">
          {/* Category pills — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-3">
            {CATEGORY_ORDER.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-[11px] tracking-[0.14em] uppercase px-4 rounded-full border transition-all shrink-0 min-h-[44px] flex items-center ${
                  category === c
                    ? 'border-white/60 text-white/90 bg-white/10'
                    : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white/60'
                }`}
              >
                {CATEGORIES[c].name}
              </button>
            ))}
          </div>

          {/* Input + mic row */}
          <div className="flex gap-3 items-center mb-3">
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`New ${CATEGORIES[category].name.toLowerCase()}...`}
              className="flex-1 bg-white/5 border border-white/15 text-white/90 text-[16px] px-4 py-3 rounded-xl focus:outline-none focus:border-white/40 placeholder-white/20 min-h-[52px]"
            />
            <button
              onClick={toggleRecording}
              title="Voice input"
              className={`w-[52px] h-[52px] rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                isRecording
                  ? 'border-red-500/70 bg-red-500/15 text-red-400 pulse-rec'
                  : 'border-white/15 text-white/50 bg-white/5 hover:border-white/30 hover:text-white/70'
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>

          {/* Full-width Add button */}
          <button
            onClick={handleAdd}
            disabled={!label.trim()}
            className="w-full min-h-[52px] bg-white/10 border border-white/25 hover:bg-white/[0.15] active:bg-white/20 text-white/90 font-medium text-sm rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed tracking-wide"
          >
            Add {CATEGORIES[category].name}
          </button>

          <div className="mt-3 text-center">
            <span className="text-[10px] text-white/25 hidden sm:inline">Enter to add · Esc to close · Shift+click to connect</span>
          </div>
        </div>
      </div>
    </>
  );
}
