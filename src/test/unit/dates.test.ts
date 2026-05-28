import { describe, it, expect } from 'vitest';
import { dayKey, daysBetween, isSameDay, isYesterday, monthKey } from '@/lib/dates';

describe('dates', () => {
  it('dayKey formats as YYYY-MM-DD with zero padding', () => {
    expect(dayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });

  it('daysBetween counts whole calendar days', () => {
    expect(daysBetween('2026-05-01', '2026-05-02')).toBe(1);
    expect(daysBetween('2026-05-01', '2026-05-08')).toBe(7);
    expect(daysBetween('2026-05-02', '2026-05-01')).toBe(-1);
    expect(daysBetween('2026-05-01', '2026-05-01')).toBe(0);
  });

  it('daysBetween spans month and year boundaries', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });

  it('isSameDay / isYesterday', () => {
    expect(isSameDay('2026-05-01', '2026-05-01')).toBe(true);
    expect(isYesterday('2026-05-01', '2026-05-02')).toBe(true);
    expect(isYesterday('2026-05-01', '2026-05-03')).toBe(false);
  });

  it('monthKey returns YYYY-MM', () => {
    expect(monthKey(new Date(2026, 4, 28))).toBe('2026-05');
  });
});
