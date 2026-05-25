import { z } from 'zod';
import { GUEST_MARKER } from '../../lib/constants';

const optionalString = z.string().trim().optional().transform(v => v && v.length > 0 ? v : null);

export const meetingSchema = z.object({
  meeting_date: z.string().min(1, 'Required'),
  title: optionalString,
  meeting_type: z.enum(['Regular', 'Special']).default('Regular'),
  status: z.enum(['Draft', 'Published']).default('Draft'),
  notes: optionalString,
  guest_list: optionalString,
});

export type MeetingFormInput = z.input<typeof meetingSchema>;
export type MeetingFormValues = z.output<typeof meetingSchema>;

export function mergeNotesWithGuests(notes: string | null, guestList: string | null): string | null {
  const cleanNotes = (notes ?? '').trim();
  const cleanGuests = (guestList ?? '').trim();
  if (!cleanGuests) return cleanNotes.length > 0 ? cleanNotes : null;
  const guestBlock = `${GUEST_MARKER}\n${cleanGuests}`;
  return cleanNotes.length > 0 ? `${cleanNotes}\n\n${guestBlock}` : guestBlock;
}

export function parseGuestList(guestList: string | null): string[] {
  if (!guestList) return [];
  return guestList.split(/[\n,]/).map(g => g.trim()).filter(Boolean);
}

export function splitNotesAndGuests(combined: string | null): { notes: string | null; guestList: string | null } {
  if (!combined) return { notes: null, guestList: null };
  const idx = combined.indexOf(GUEST_MARKER);
  if (idx === -1) return { notes: combined, guestList: null };
  const notesPart = combined.slice(0, idx).trim();
  const guestsPart = combined.slice(idx + GUEST_MARKER.length).trim();
  return {
    notes: notesPart.length > 0 ? notesPart : null,
    guestList: guestsPart.length > 0 ? guestsPart : null,
  };
}
