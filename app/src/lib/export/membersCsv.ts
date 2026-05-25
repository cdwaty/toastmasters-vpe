import type { Member } from '../../types';
import { rowsToCsv } from './csv';

const COLUMNS = [
  'legacy_id', 'full_name', 'email', 'phone', 'location',
  'member_type', 'club_preference', 'join_date', 'exit_date',
  'paid_until', 'education_award', 'aliases',
] as const;

export function membersToCsv(members: Member[]): string {
  return rowsToCsv(
    members.map(m => ({
      legacy_id: m.legacy_id ?? '',
      full_name: m.full_name,
      email: m.email ?? '',
      phone: m.phone ?? '',
      location: m.location ?? '',
      member_type: m.member_type ?? '',
      club_preference: m.club_preference ?? '',
      join_date: m.join_date ?? '',
      exit_date: m.exit_date ?? '',
      paid_until: m.paid_until ?? '',
      education_award: m.education_award ?? '',
      aliases: m.aliases ?? [],
    })),
    [...COLUMNS],
  );
}
