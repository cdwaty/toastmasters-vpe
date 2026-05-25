import { EMPTY_DISPLAY } from './constants';

export function formatDate(value: string | null | undefined, fallback = EMPTY_DISPLAY): string {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateLong(value: string | null | undefined, fallback = EMPTY_DISPLAY): string {
  if (!value) return fallback;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return fallback;
  return d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatMonthDay(value: string | null | undefined): { day: string; month: string; year: string } {
  if (!value) return { day: EMPTY_DISPLAY, month: '', year: '' };
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return { day: EMPTY_DISPLAY, month: '', year: '' };
  return {
    day: String(d.getDate()),
    month: d.toLocaleDateString(undefined, { month: 'short' }).toUpperCase(),
    year: String(d.getFullYear()),
  };
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return EMPTY_DISPLAY;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return EMPTY_DISPLAY;
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
