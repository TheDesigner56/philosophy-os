'use client';

import { useState, useRef, useEffect } from 'react';
import { Category, CATEGORIES, CATEGORY_ORDER } from '@/types';
import BottomSheet from './BottomSheet';

interface AddPanelProps {
  onAdd: (category: Category, label: string) => void;
  onClose: () => void;
}

// Minimal inline type so we don't depend on DOM lib SpeechRecognition declarations
type SREvent = {
  results: {
    length: number;
    [n: number]: { isFinal: boolean; [n: number]: { transcript: string } };
  };
};
type SRInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SREvent) => void) | null;
  onerror: ((e: Event) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SRCtor = new () => SRInstance;

export default function AddPanel({ onAdd, onClose }: AddPanelProps) {
  const [category, setCategory] = useState<Category>('thought');
  const [label, setLabel] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechUnsupported, setSpeechUnsupported] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SRInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Exposed for consumers that want the captured audio blob
  const audioBlobRef = useRef<Blob | null>(null);
  // Snapshot of label text at the moment recording begins
  const baseLabelRef = useRef('');

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    (isMobile ? mobileInputRef : inputRef).current?.focus();
  }, []);

  const handleAdd = () => {
    if (!label.trim()) return;
    onAdd(category, label.trim());
    setLabel('');
    (window.matchMedia('(max-width: 767px)').matches ? mobileInputRef : inputRef).current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onClose();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    const win = window as unknown as Record<string, SRCtor | undefined>;
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;

    if (!SR) {
      setSpeechUnsupported(true);
      setTimeout(() => setSpeechUnsupported(false), 3000);
      return;
    }

    // Snapshot existing label so we can prepend it to speech transcript
    baseLabelRef.current = label;

    // ── MediaRecorder (best-effort audio blob capture) ──────────────────────
    if (typeof MediaRecorder !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };
        mr.onstop = () => {
          audioBlobRef.current = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach((t) => t.stop());
        };
        mr.start();
        mediaRecorderRef.current = mr;
      } catch {
        // Mic permission denied or MediaRecorder unavailable — continue without blob
      }
    }

    // ── SpeechRecognition ────────────────────────────────────────────────────
    try {
      const rec = new SR();
      rec.lang = 'en-US';
      rec.interimResults = true; // real-time interim results shown in input
      rec.continuous = true;     // keep recording until user manually stops

      rec.onresult = (e: SREvent) => {
        // Accumulate ALL results on every event: collect final vs interim separately
        let finalText = '';
        let interimText = '';
        for (let i = 0; i < e.results.length; i++) {
          const r = e.results[i];
          if (r.isFinal) {
            finalText += r[0].transcript;
          } else {
            interimText += r[0].transcript;
          }
        }
        const transcript = finalText + interimText;
        if (!transcript) return;
        const base = baseLabelRef.current;
        setLabel(base ? `${base} ${transcript}` : transcript);
      };

      rec.onend = () => {
        setIsRecording(false);
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      };

      rec.onerror = () => stopRecording();

      rec.start();
      recognitionRef.current = rec;
      setIsRecording(true);
    } catch {
      setIsRecording(false);
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    }
  };

  const statusText = speechUnsupported
    ? 'Voice input not supported in this browser'
    : isRecording
    ? 'Listening… click mic to stop'
    : null;

  const pillRow = (size: 'sm' | 'md' = 'sm') => (
    <div className="no-scrollbar overflow-x-auto -mx-1 px-1">
      <div className="flex gap-2 min-w-max">
        {CATEGORY_ORDER.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`${
              size === 'md' ? 'px-4 py-2 text-[11px]' : 'px-3 py-1 text-[10px]'
            } tracking-[0.15em] uppercase rounded-full border transition-colors shrink-0 whitespace-nowrap ${
              category === c
                ? 'border-white/60 text-white/95 bg-white/10'
                : 'border-white/15 text-white/45 hover:border-white/30 hover:text-white/70'
            }`}
          >
            {CATEGORIES[c].name}
          </button>
        ))}
      </div>
    </div>
  );

  const micButton = (sizeCls: string) => (
    <button
      onClick={toggleRecording}
      title="Voice input"
      aria-label="Voice input"
      className={`${sizeCls} rounded border flex items-center justify-center transition-colors shrink-0 ${
        isRecording
          ? 'border-red-500 bg-red-500/15 text-red-400 pulse-rec ring-pulse'
          : 'border-white/15 text-white/40 hover:border-white/30 hover:text-white/70'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );

  const addButton = (sizeCls: string) => (
    <button
      onClick={handleAdd}
      disabled={!label.trim()}
      aria-label="Add"
      className={`${sizeCls} rounded border border-white/25 text-white/80 hover:border-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors shrink-0 text-lg leading-none`}
    >
      +
    </button>
  );

  return (
    <>
      {/* Mobile: bottom sheet */}
      <BottomSheet open onClose={onClose} ariaLabel="Add node">
        <div className="px-4 pb-4 pt-1 space-y-3">
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
              Category
            </div>
            {pillRow('md')}
          </div>
          <div>
            <div className="text-[10px] tracking-[0.25em] uppercase text-white/40 mb-2">
              {CATEGORIES[category].name}
            </div>
            <div className="flex gap-2 items-center">
              <input
                ref={mobileInputRef}
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`New ${CATEGORIES[category].name.toLowerCase()}...`}
                autoCapitalize="sentences"
                className={`flex-1 bg-[#1a1a1a] border text-white text-base px-3.5 py-3 rounded-lg focus:outline-none placeholder-white/25 min-h-[44px] transition-colors ${
                  isRecording ? 'border-red-500/40' : 'border-white/15 focus:border-white/40'
                }`}
              />
              {micButton('w-11 h-11')}
            </div>
            {statusText && (
              <p className={`text-[11px] mt-1.5 ${isRecording ? 'text-red-400/80 pulse-rec' : 'text-red-400/70'}`}>
                {statusText}
              </p>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 touch-target text-xs text-white/60 hover:text-white/90 border border-white/10 hover:border-white/25 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!label.trim()}
              className="flex-[2] touch-target text-xs tracking-[0.15em] uppercase text-[#0A0A0A] bg-white hover:bg-white/90 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors font-medium"
            >
              Add {CATEGORIES[category].name}
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* Desktop: floating card */}
      <div className="hidden md:block absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-30 view-enter">
        <div className="bg-[#111111] border border-white/15 rounded-lg p-4 shadow-2xl">
          <div className="mb-3">{pillRow('sm')}</div>

          <div className="flex gap-2 items-center">
            <input
              ref={inputRef}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`New ${CATEGORIES[category].name.toLowerCase()}...`}
              className={`flex-1 bg-transparent border text-white/90 text-sm px-3 py-2 rounded focus:outline-none placeholder-white/20 transition-colors ${
                isRecording ? 'border-red-500/40' : 'border-white/15 focus:border-white/40'
              }`}
            />
            {micButton('w-9 h-9')}
            {addButton('w-9 h-9')}
          </div>

          <div className="mt-2 flex justify-between items-center">
            {statusText ? (
              <span className={`text-[10px] ${isRecording ? 'text-red-400/80 pulse-rec' : 'text-red-400/70'}`}>
                {statusText}
              </span>
            ) : (
              <span className="text-[10px] text-white/25">
                Enter to add · Esc to close · Shift+click to connect
              </span>
            )}
            <button
              onClick={onClose}
              className="text-[10px] text-white/30 hover:text-white/60 transition-colors"
            >
              close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
