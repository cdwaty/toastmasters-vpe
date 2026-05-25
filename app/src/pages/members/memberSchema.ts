import { z } from 'zod';

const emptyToNull = (value: unknown) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const optionalString = z.preprocess(emptyToNull, z.string().trim().nullable());

const optionalEmail = z.preprocess(
  emptyToNull,
  z
    .string()
    .trim()
    .nullable()
    .refine(
      v => v === null || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Invalid email',
    ),
);

const optionalDate = z.preprocess(emptyToNull, z.string().nullable());

const memberTypeSchema = z.preprocess(
  emptyToNull,
  z.enum(['Internal', 'External']).nullable(),
);

const clubPreferenceSchema = z.preprocess(
  emptyToNull,
  z.enum(['Tahi', 'Yarning Circle', 'Both']).nullable(),
);

export const memberSchema = z.object({
  full_name: z.string().trim().min(1, 'Required'),
  email: optionalEmail,
  phone: optionalString,
  location: optionalString,
  member_type: memberTypeSchema,
  club_preference: clubPreferenceSchema,
  join_date: optionalDate,
  exit_date: optionalDate,
  paid_until: optionalDate,
  education_award: optionalString,
});

export type MemberFormInput = z.input<typeof memberSchema>;
export type MemberFormValues = z.output<typeof memberSchema>;
