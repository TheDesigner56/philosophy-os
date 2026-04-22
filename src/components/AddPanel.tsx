'use client';

import { useState, useRef, useEffect } from 'react';
import { Category, CATEGORIES, CATEGORY_ORDER } from '@/types';

interface AddPanelProps {
  onAdd: (category: Category, label: string) => void;
  onClose: () => void;
}

// Minimal local types to avoid conflicts with varying TS DOM lib versions
type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<{ isFinal: boolean; 0: { transcript: string } }>;
};
type SpeechRecInstance = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type SpeechRecCtor = new () => SpeechRecInstance;

export default function AddPanel({ onAdd, onClose }: AddPanelProps) {
  const [category, setCategory] = useState<Category>('thought');
  const [label, setLabel] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Combined display value: committed text + live interim
  const displayValue = isRecording && interimText
    ? `${label}${label ? ' ' : ''}${interimText}`
    : label;

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setInterimText('');
  };

  const handleAdd = () => {
    const text = displayValue.trim();
    if (!text) return;
    if (isRecording) stopRecording();
    onAdd(category, text);
    setLabel('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAdd();
    if (e.key === 'Escape') onClose();
  };

  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    const win = window as unknown as { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
    const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
    if (!SR) {
      setVoiceUnsupported(true);
      setTimeout(() => setVoiceUnsupported(false), 3000);
      return;
    }

    // Capture raw audio for future storage; ignore permission errors
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
    } catch {
      // mic permission denied — speech recognition may still work
    }

    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = true;
    rec.continuous = true;

    rec.onresult = (e: SpeechResultEvent) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        if (r.isFinal) {
          final += r[0].transcript;
        } else {
          interim += r[0].transcript;
        }
      }
      if (final) {
        setLabel((prev) => (prev ? `${prev} ${final}` : final).trimStart());
      }
      setInterimText(interim);
    };

    rec.onend = () => {
      setIsRecording(false);
      setInterimText('');
    };

    rec.onerror = () => stopRecording();

    rec.start();
    recognitionRef.current = rec;
    setIsRecording(true);
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
            value={displayValue}
            onChange={(e) => {
              setLabel(e.target.value);
              if (isRecording) setInterimText('');
            }}
            onKeyDown={handleKeyDown}
            placeholder={`New ${CATEGORIES[category].name.toLowerCase()}...`}
            className="flex-1 bg-transparent border border-white/15 text-white/90 text-sm px-3 py-2 rounded focus:outline-none focus:border-white/40 placeholder-white/20"
          />

          {/* Mic button with pulsing red ring while recording */}
          <div className="relative shrink-0">
            {isRecording && (
              <span className="absolute inset-0 rounded animate-ping bg-red-500/25 pointer-events-none" />
            )}
            <button
              onClick={toggleRecording}
              title={isRecording ? 'Stop recording' : 'Voice input'}
              aria-label={isRecording ? 'Stop recording' : 'Voice input'}
              className={`relative w-9 h-9 rounded border flex items-center justify-center transition-colors ${
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
          </div>

          {/* Add */}
          <button
            onClick={handleAdd}
            disabled={!displayValue.trim()}
            className="w-9 h-9 rounded border border-white/25 text-white/70 hover:border-white/50 hover:text-white disabled:opacity-30 flex items-center justify-center transition-colors shrink-0 text-lg leading-none"
          >
            +
          </button>
        </div>

        <div className="mt-2 flex justify-between items-center">
          {voiceUnsupported ? (
            <span className="text-[10px] text-red-400/80">
              Voice input not supported in this browser
            </span>
          ) : (
            <span className="text-[10px] text-white/25">
              Enter to add · Esc to close · Shift+click to connect
            </span>
          )}
          <button onClick={onClose} className="text-[10px] text-white/30 hover:text-white/60 transition-colors">
            close
          </button>
        </div>
      </div>
    </div>
  );
}
