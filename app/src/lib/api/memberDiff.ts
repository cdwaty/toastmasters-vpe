import type { Member } from '../../types';
import type { HistoryEntry } from './changeHistory';

const TRACKED_FIELDS: { key: keyof Member; label: string }[] = [
  { key: 'full_name', label: 'Full name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'location', label: 'Location' },
  { key: 'member_type', label: 'Member type' },
  { key: 'club_preference', label: 'Club preference' },
  { key: 'join_date', label: 'Join date' },
  { key: 'paid_until', label: 'Paid until' },
  { key: 'exit_date', label: 'Exit date' },
  { key: 'education_award', label: 'Education award' },
];

function toDisplay(value: unknown): string | null {
  if (value === null || value === undefined || value === '') return null;
  if (Array.isArray(value)) return value.length === 0 ? null : value.join('; ');
  return String(value);
}

export function diffMember(previous: Member, patch: Partial<Member>): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const { key, label } of TRACKED_FIELDS) {
    if (!(key in patch)) continue;
    const oldDisplay = toDisplay(previous[key]);
    const newDisplay = toDisplay(patch[key] as unknown);
    if (oldDisplay === newDisplay) continue;
    entries.push({ label, old_value: oldDisplay, new_value: newDisplay });
  }
  return entries;
}
