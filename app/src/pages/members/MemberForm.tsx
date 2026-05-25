import { ReactNode } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { Avatar, Badge, Button, FormField, Select, TextInput } from '../../components/ui';
import { INPUT_BASE } from '../../components/ui/styles';
import { memberSchema, MemberFormInput, MemberFormValues } from './memberSchema';
import { DEFAULT_LOCATIONS } from '../../utils/locations';
import { formatDate } from '../../lib/format';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';
import type { Member } from '../../types';

interface MemberFormProps {
  initialValues?: Partial<Member>;
  submitLabel?: string;
  onCancel?: () => void;
  onSubmit: (values: MemberFormValues) => Promise<void> | void;
  aside?: ReactNode;
}

const memberTypeOptions = [
  { value: 'Internal', label: 'Internal' },
  { value: 'External', label: 'External' },
];

const clubOptions = [
  { value: 'Tahi', label: 'Tahi' },
  { value: 'Yarning Circle', label: 'Yarning Circle' },
  { value: 'Both', label: 'Both' },
];

const LOCATION_OPTIONS = DEFAULT_LOCATIONS.map(l => ({ value: l, label: l }));

function toFormDefaults(values?: Partial<Member>): MemberFormInput {
  return {
    full_name: values?.full_name ?? '',
    email: values?.email ?? '',
    phone: values?.phone ?? '',
    location: values?.location ?? '',
    member_type: values?.member_type ?? null,
    club_preference: values?.club_preference ?? null,
    join_date: values?.join_date ?? '',
    exit_date: values?.exit_date ?? '',
    paid_until: values?.paid_until ?? '',
    education_award: values?.education_award ?? '',
  };
}

export function MemberForm({ initialValues, submitLabel = 'Save member', onCancel, onSubmit, aside }: MemberFormProps) {
  const methods = useForm<MemberFormInput, unknown, MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: toFormDefaults(initialValues),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty, isSubmitSuccessful } } = methods;
  useBeforeUnload(isDirty && !isSubmitSuccessful);

  const formNode = (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(
        'bg-white border border-line rounded-2xl shadow-soft p-7 flex flex-col gap-6',
        aside ? 'w-full' : 'max-w-3xl',
      )}
    >
      <section className="flex flex-col gap-5">
        <h2 className="text-xs uppercase tracking-caps text-ink-mid font-semibold">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Full name" requiredMark {...register('full_name')} error={errors.full_name?.message} />
          <TextInput label="Email" type="email" {...register('email')} error={errors.email?.message} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput label="Phone" {...register('phone')} error={errors.phone?.message} />
          <Select
            label="Location"
            {...register('location')}
            options={LOCATION_OPTIONS}
            placeholder="Select location"
            error={errors.location?.message}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput
            label="Education award (optional)"
            {...register('education_award')}
            error={errors.education_award?.message}
          />
          <div />
        </div>
      </section>

      <hr className="border-line" />

      <section className="flex flex-col gap-5">
        <h2 className="text-xs uppercase tracking-caps text-ink-mid font-semibold">
          Membership Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Member type"
            requiredMark
            {...register('member_type')}
            options={memberTypeOptions}
            placeholder="Select type"
            error={errors.member_type?.message}
          />
          <Select
            label="Club preference"
            {...register('club_preference')}
            options={clubOptions}
            placeholder="Select club"
            error={errors.club_preference?.message}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Join date" required error={errors.join_date?.message}>
            <input type="date" className={INPUT_BASE} {...register('join_date')} />
          </FormField>
          <FormField label="Membership paid until" error={errors.paid_until?.message}>
            <input type="date" className={INPUT_BASE} {...register('paid_until')} />
          </FormField>
        </div>
        <FormField label="Exit date (leave blank = Active)" error={errors.exit_date?.message}>
          <input type="date" className={INPUT_BASE} {...register('exit_date')} />
        </FormField>
      </section>

      <div className="flex items-center justify-between gap-2.5 pt-2 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          onClick={() => reset(toFormDefaults(initialValues))}
        >
          Clear
        </Button>
        <div className="flex gap-2.5">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          )}
          <Button type="submit" loading={isSubmitting}>{submitLabel}</Button>
        </div>
      </div>
    </form>
  );

  if (!aside) {
    return <FormProvider {...methods}>{formNode}</FormProvider>;
  }

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start">
        {formNode}
        <div className="xl:sticky xl:top-20">{aside}</div>
      </div>
    </FormProvider>
  );
}

export function MemberPreviewCard() {
  const values = useWatch() as Partial<MemberFormInput> | undefined;
  const name = (values?.full_name ?? '').toString().trim() || 'New Member';
  const email = (values?.email ?? '').toString().trim();
  const phone = (values?.phone ?? '').toString().trim();
  const location = (values?.location ?? '').toString().trim();
  const memberType = values?.member_type ?? null;
  const club = values?.club_preference ?? null;
  const joinDate = (values?.join_date ?? '').toString();
  const paidUntil = (values?.paid_until ?? '').toString();
  const exitDate = (values?.exit_date ?? '').toString();
  const educationAward = (values?.education_award ?? '').toString().trim();
  const isActive = !exitDate;

  return (
    <div className="bg-white border border-line rounded-2xl shadow-soft p-6 flex flex-col gap-4">
      <div className="text-[11px] uppercase tracking-caps text-ink-light font-semibold">
        Live preview
      </div>
      <div className="flex items-center gap-3">
        <Avatar name={name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="font-serif text-lg text-ink truncate">{name}</div>
          <div className="text-xs text-ink-light truncate">{email || '—'}</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {memberType && (
          <Badge tone={memberType === 'External' ? 'warning' : 'info'}>{String(memberType)}</Badge>
        )}
        {club && (
          <Badge tone={club === 'Yarning Circle' ? 'yarning' : 'tahi'}>{String(club)}</Badge>
        )}
        <Badge tone={isActive ? 'success' : 'neutral'}>{isActive ? 'Active' : 'Inactive'}</Badge>
        {educationAward && <Badge tone="info">{educationAward}</Badge>}
      </div>
      <dl className="flex flex-col gap-2 text-sm">
        <PreviewRow label="Phone" value={phone || '—'} />
        <PreviewRow label="Location" value={location || '—'} />
        <PreviewRow label="Joined" value={joinDate ? formatDate(joinDate) : '—'} />
        <PreviewRow label="Paid until" value={paidUntil ? formatDate(paidUntil) : '—'} />
        {exitDate && <PreviewRow label="Exited" value={formatDate(exitDate)} />}
      </dl>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-light">{label}</dt>
      <dd className="text-ink-mid text-right truncate">{value}</dd>
    </div>
  );
}
