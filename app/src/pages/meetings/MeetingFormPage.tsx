import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useParams } from 'react-router';
import { useMeetings } from '../../contexts/MeetingContext';
import { useToast } from '../../contexts/ToastContext';
import { useMembers } from '../../contexts/MemberContext';
import { useReferenceData } from '../../contexts/ReferenceDataContext';
import {
  Button, Card, CardBody, ConfirmDialog, EmptyState, FormField, PageHeader, Select, TextInput,
} from '../../components/ui';
import { INPUT_BASE } from '../../components/ui/styles';
import {
  meetingSchema, MeetingFormInput, MeetingFormValues,
  mergeNotesWithGuests, splitNotesAndGuests,
} from './meetingSchema';
import { listAttendance, listMeetingRoles } from '../../lib/api/meetings';
import type { MeetingAttendance, MeetingRole, RoleType } from '../../types';
import { ROLE_GROUPS, MULTI_SLOT_KEYS } from './roleGroups';
import {
  AttendanceMap, RoleSlots,
  buildInitialAttendance, buildInitialSlots,
  computeAttendanceDirty, computeRolesDirty,
} from './meetingFormHelpers';
import { persistAttendance, persistRoles } from './meetingPersistence';
import { RoleAssignmentSection } from './RoleAssignmentSection';
import { RolesFilledCard } from './RolesFilledCard';
import { AttendanceSidebar } from './AttendanceSidebar';
import { useBeforeUnload } from '../../hooks/useBeforeUnload';

export function MeetingFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { getMeeting, addMeeting, updateMeeting } = useMeetings();
  const { notify } = useToast();
  const { roleTypes } = useReferenceData();
  const { members } = useMembers();
  const existing = id ? getMeeting(id) : undefined;

  const activeMembers = useMemo(() => members.filter(m => !m.exit_date), [members]);

  const initialSplit = splitNotesAndGuests(existing?.notes ?? null);

  const {
    register, handleSubmit, watch, formState: { errors, isSubmitting, isDirty },
  } = useForm<MeetingFormInput, unknown, MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      meeting_date: existing?.meeting_date ?? '',
      title: existing?.title ?? '',
      meeting_type: existing?.meeting_type ?? 'Regular',
      status: existing?.status ?? 'Draft',
      notes: initialSplit.notes ?? '',
      guest_list: initialSplit.guestList ?? '',
    },
  });

  const watchedStatus = watch('status');

  const [roleSlots, setRoleSlots] = useState<RoleSlots>({});
  const [originalRoles, setOriginalRoles] = useState<MeetingRole[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [originalAttendance, setOriginalAttendance] = useState<MeetingAttendance[]>([]);
  const autoMarkedRef = useRef<Set<string>>(new Set());
  const userTouchedRef = useRef<Set<string>>(new Set());
  const attendanceRef = useRef<AttendanceMap>({});
  const [attendanceInited, setAttendanceInited] = useState(false);
  const [rolesInited, setRolesInited] = useState(false);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);
  const justSavedRef = useRef(false);

  const rolesDirty = useMemo(
    () => computeRolesDirty(roleSlots, originalRoles),
    [roleSlots, originalRoles],
  );

  const attendanceDirty = useMemo(
    () => computeAttendanceDirty(attendance, originalAttendance),
    [attendance, originalAttendance],
  );

  const hasUnsavedChanges = isDirty || rolesDirty || attendanceDirty;
  useBeforeUnload(hasUnsavedChanges && !justSavedRef.current);

  const tryLeave = () => {
    if (hasUnsavedChanges && !justSavedRef.current) {
      setConfirmDiscardOpen(true);
      return;
    }
    navigate('/meetings');
  };

  useEffect(() => {
    if (roleTypes.length === 0) return;
    if (rolesInited) return;
    if (!isEdit || !existing) {
      setRoleSlots(buildInitialSlots(roleTypes, []));
      setRolesInited(true);
      return;
    }
    void (async () => {
      const result = await listMeetingRoles(existing.id);
      if (result.ok) {
        setOriginalRoles(result.data);
        setRoleSlots(buildInitialSlots(roleTypes, result.data));
        setRolesInited(true);
      }
    })();
  }, [roleTypes, isEdit, existing?.id, rolesInited]);

  useEffect(() => {
    if (attendanceInited) return;
    if (activeMembers.length === 0 && !isEdit) return;
    if (!isEdit || !existing) {
      setAttendance(buildInitialAttendance(activeMembers, []));
      setAttendanceInited(true);
      return;
    }
    void (async () => {
      const result = await listAttendance(existing.id);
      if (result.ok) {
        setOriginalAttendance(result.data);
        setAttendance(buildInitialAttendance(activeMembers, result.data));
        setAttendanceInited(true);
      }
    })();
  }, [isEdit, existing?.id, activeMembers, attendanceInited]);

  useEffect(() => {
    attendanceRef.current = attendance;
  }, [attendance]);

  useEffect(() => {
    if (!rolesInited || !attendanceInited) return;

    const assigned = new Set<string>();
    for (const memberIds of Object.values(roleSlots)) {
      for (const memberId of memberIds) {
        if (memberId) assigned.add(memberId);
      }
    }
    const autoMarked = autoMarkedRef.current;
    const current = attendanceRef.current;
    const next = { ...current };
    let changed = false;

    for (const memberId of assigned) {
      if (next[memberId] == null && !userTouchedRef.current.has(memberId)) {
        next[memberId] = 'attended';
        autoMarked.add(memberId);
        changed = true;
      }
    }
    for (const memberId of Array.from(autoMarked)) {
      if (!assigned.has(memberId)) {
        if (next[memberId] === 'attended') {
          next[memberId] = null;
          changed = true;
        }
        autoMarked.delete(memberId);
      }
    }

    if (changed) {
      attendanceRef.current = next;
      setAttendance(next);
    }
  }, [roleSlots, rolesInited, attendanceInited]);

  const meetingLabel = (m: { title?: string | null; meeting_date: string }) =>
    m.title?.trim() ? `"${m.title}"` : `meeting on ${m.meeting_date}`;

  const onSubmit = async (values: MeetingFormValues) => {
    const combinedNotes = mergeNotesWithGuests(values.notes, values.guest_list);
    const meetingPayload = {
      meeting_date: values.meeting_date,
      title: values.title,
      meeting_type: values.meeting_type,
      status: values.status,
      notes: combinedNotes,
    };

    let meetingId: string;
    if (isEdit && existing) {
      const updated = await updateMeeting(existing.id, meetingPayload);
      if (!updated) {
        notify(`Failed to save ${meetingLabel(existing)}`, 'error');
        return;
      }
      meetingId = updated.id;
    } else {
      const created = await addMeeting(meetingPayload);
      if (!created) {
        notify('Failed to create meeting. Try again.', 'error');
        return;
      }
      meetingId = created.id;
    }

    const rolesOk = await persistRoles(meetingId, roleSlots, originalRoles);
    const attendanceOk = rolesOk
      ? await persistAttendance(meetingId, attendance, originalAttendance)
      : false;

    if (!rolesOk || !attendanceOk) {
      const failed = !rolesOk ? 'role assignments' : 'attendance updates';
      notify(`Meeting saved, but ${failed} failed. Please retry — your changes are still on the form.`, 'error');
      return;
    }

    notify(isEdit ? 'Meeting saved' : 'Meeting created');
    justSavedRef.current = true;
    navigate('/meetings');
  };

  const updateSlot = useCallback((roleTypeId: string, slotIndex: number, memberId: string | null) => {
    setRoleSlots(prev => {
      const next = { ...prev };
      const slots = [...(next[roleTypeId] ?? [])];
      slots[slotIndex] = memberId;
      next[roleTypeId] = slots;
      return next;
    });
  }, []);

  const addSlot = useCallback((roleTypeId: string) => {
    setRoleSlots(prev => ({ ...prev, [roleTypeId]: [...(prev[roleTypeId] ?? []), null] }));
  }, []);

  const toggleAttendance = useCallback((memberId: string, target: 'attended' | 'apology') => {
    autoMarkedRef.current.delete(memberId);
    userTouchedRef.current.add(memberId);
    setAttendance(prev => ({ ...prev, [memberId]: prev[memberId] === target ? null : target }));
  }, []);

  const rolesByKey = useMemo(() => {
    const map = new Map<string, RoleType>();
    for (const rt of roleTypes) map.set(rt.role_key, rt);
    return map;
  }, [roleTypes]);

  const filledRoles = useMemo(() => {
    const lines: { label: string; member: string }[] = [];
    for (const group of ROLE_GROUPS) {
      for (const key of group.keys) {
        const roleType = rolesByKey.get(key);
        if (!roleType) continue;
        const slots = roleSlots[roleType.id] ?? [];
        slots.forEach((memberId, idx) => {
          if (!memberId) return;
          const member = activeMembers.find(m => m.id === memberId);
          if (!member) return;
          const isMulti = MULTI_SLOT_KEYS.has(key);
          lines.push({
            label: isMulti ? `${roleType.display_name} #${idx + 1}` : roleType.display_name,
            member: member.full_name,
          });
        });
      }
    }
    return lines;
  }, [roleSlots, rolesByKey, activeMembers]);

  const memberOptions = useMemo(
    () => activeMembers.map(m => ({ value: m.id, label: m.full_name })),
    [activeMembers],
  );

  if (isEdit && !existing) {
    return (
      <EmptyState
        title="Meeting not found"
        action={<Button onClick={tryLeave}>Back to meetings</Button>}
      />
    );
  }

  return (
    <>
    <ConfirmDialog
      open={confirmDiscardOpen}
      title="Discard unsaved changes?"
      message="You have unsaved changes on this meeting."
      description="Leaving now will discard role assignments, attendance, and any edited details."
      confirmLabel="Discard"
      cancelLabel="Keep editing"
      variant="danger"
      onConfirm={() => { setConfirmDiscardOpen(false); navigate('/meetings'); }}
      onCancel={() => setConfirmDiscardOpen(false)}
    />
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <PageHeader
        title={isEdit ? 'Edit Meeting' : 'New Meeting'}
        description="Record a club meeting"
        actions={
          <Button
            variant="secondary"
            onClick={tryLeave}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to Meetings
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Card>
            <CardBody className="flex flex-col gap-5">
              <h3 className="font-serif text-lg text-ink">Meeting Details</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Date" required error={errors.meeting_date?.message}>
                  <input type="date" className={INPUT_BASE} {...register('meeting_date')} />
                </FormField>
                <Select
                  label="Meeting type"
                  required
                  {...register('meeting_type')}
                  options={[{ value: 'Regular', label: 'Regular' }, { value: 'Special', label: 'Special' }]}
                />
              </div>

              <TextInput
                label="Theme / Title"
                hint="optional"
                placeholder="e.g. Be the Change, Sustainability Night…"
                {...register('title')}
                error={errors.title?.message}
              />

              <FormField label="Guest list" hint="optional — one name per line">
                <textarea
                  className={`${INPUT_BASE} resize-y min-h-24`}
                  rows={3}
                  placeholder={'e.g. Jane Smith\nBob Jones'}
                  {...register('guest_list')}
                />
              </FormField>

              <FormField label="Notes" hint="optional" error={errors.notes?.message}>
                <textarea
                  className={`${INPUT_BASE} resize-y min-h-24`}
                  rows={4}
                  placeholder="Any notes about this meeting…"
                  {...register('notes')}
                />
              </FormField>
            </CardBody>
          </Card>

          <RoleAssignmentSection
            roleSlots={roleSlots}
            rolesByKey={rolesByKey}
            memberOptions={memberOptions}
            activeMembers={activeMembers}
            updateSlot={updateSlot}
            addSlot={addSlot}
          />
        </div>

        <div className="flex flex-col gap-6 lg:sticky lg:top-6 self-start">
          <Card>
            <CardBody className="flex flex-col gap-3">
              <h3 className="font-serif text-lg text-ink">Publish Status</h3>
              <label className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-colors ${watchedStatus === 'Draft' ? 'border-burgundy bg-burgundy/5' : 'border-cream-dark hover:border-cream-dark/80'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" value="Draft" {...register('status')} className="accent-burgundy" />
                  <span className="font-medium text-ink">Draft</span>
                </div>
                <span className="text-xs text-ink-light pl-6">Work in progress — not finalised</span>
              </label>
              <label className={`flex flex-col gap-1 p-3 rounded-xl border cursor-pointer transition-colors ${watchedStatus === 'Published' ? 'border-burgundy bg-burgundy/5' : 'border-cream-dark hover:border-cream-dark/80'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" value="Published" {...register('status')} className="accent-burgundy" />
                  <span className="font-medium text-ink">Published</span>
                </div>
                <span className="text-xs text-ink-light pl-6">Complete and finalised</span>
              </label>

              <div className="flex flex-col gap-2 pt-1">
                <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>Save Meeting</Button>
                <Button type="button" variant="secondary" onClick={tryLeave}>Cancel</Button>
              </div>
            </CardBody>
          </Card>

          <RolesFilledCard filledRoles={filledRoles} />

          <AttendanceSidebar
            activeMembers={activeMembers}
            attendance={attendance}
            toggleAttendance={toggleAttendance}
          />
        </div>
      </div>
    </form>
    </>
  );
}
