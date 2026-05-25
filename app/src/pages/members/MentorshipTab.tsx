import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAsync } from '../../hooks/useAsync';
import { useMembers } from '../../contexts/MemberContext';
import { useToast } from '../../contexts/ToastContext';
import {
  createMentorship, deleteMentorship, listMentorshipsForMember,
} from '../../lib/api/mentorships';
import { recordMemberHistory } from '../../lib/api/changeHistory';
import {
  Avatar, Button, ConfirmDialog, Select, Skeleton, TrashIcon,
} from '../../components/ui';
import { formatDate } from '../../lib/format';
import type { Member, Mentorship } from '../../types';

interface MentorshipTabProps {
  memberId: string;
}

type Role = 'mentor' | 'mentee';

export function MentorshipTab({ memberId }: MentorshipTabProps) {
  const { members, getMember } = useMembers();
  const { notify } = useToast();
  const { data: mentorships, loading, error, reload } = useAsync(
    () => listMentorshipsForMember(memberId),
    [memberId],
  );

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { mentors, mentees } = useMemo(() => {
    const list = mentorships ?? [];
    return {
      mentors: list.filter(m => m.mentee_id === memberId),
      mentees: list.filter(m => m.mentor_id === memberId),
    };
  }, [mentorships, memberId]);

  const linkedIds = useMemo(() => {
    const ids = new Set<string>([memberId]);
    for (const m of mentorships ?? []) {
      ids.add(m.mentor_id);
      ids.add(m.mentee_id);
    }
    return ids;
  }, [mentorships, memberId]);

  const availableMembers = useMemo(
    () => members.filter(m => !linkedIds.has(m.id) && !m.exit_date),
    [members, linkedIds],
  );

  const handleAdd = async (role: Role, partnerId: string) => {
    if (!partnerId) return false;
    const input = role === 'mentee'
      ? { mentor_id: memberId, mentee_id: partnerId }
      : { mentor_id: partnerId, mentee_id: memberId };
    const result = await createMentorship({
      ...input,
      start_date: new Date().toISOString().slice(0, 10),
    });
    const partnerName = getMember(partnerId)?.full_name ?? 'Unknown';
    if (!result.ok) {
      notify(`Failed to add: ${result.error.message}`, 'error');
      return false;
    }
    notify(role === 'mentee' ? `Now mentoring ${partnerName}` : `${partnerName} added as mentor`);
    const ownerName = getMember(memberId)?.full_name ?? 'Unknown';
    const selfLabel = role === 'mentee' ? `Mentee added: ${partnerName}` : `Mentor added: ${partnerName}`;
    const partnerLabel = role === 'mentee' ? `Mentor added: ${ownerName}` : `Mentee added: ${ownerName}`;
    await Promise.all([
      recordMemberHistory(memberId, [{ label: selfLabel, old_value: null, new_value: null }]),
      recordMemberHistory(partnerId, [{ label: partnerLabel, old_value: null, new_value: null }]),
    ]);
    reload();
    return true;
  };

  const handleDelete = async (id: string) => {
    const mentorship = mentorships?.find(m => m.id === id);
    const result = await deleteMentorship(id);
    if (!result.ok) {
      notify(`Failed to remove: ${result.error.message}`, 'error');
      setConfirmDelete(null);
      return;
    }
    if (mentorship) {
      const otherId = mentorship.mentor_id === memberId ? mentorship.mentee_id : mentorship.mentor_id;
      const otherName = getMember(otherId)?.full_name ?? 'member';
      const mentorName = getMember(mentorship.mentor_id)?.full_name ?? 'Unknown';
      const menteeName = getMember(mentorship.mentee_id)?.full_name ?? 'Unknown';
      notify(`Mentorship with ${otherName} removed`);
      await Promise.all([
        recordMemberHistory(mentorship.mentor_id, [
          { label: `Mentee removed: ${menteeName}`, old_value: null, new_value: null },
        ]),
        recordMemberHistory(mentorship.mentee_id, [
          { label: `Mentor removed: ${mentorName}`, old_value: null, new_value: null },
        ]),
      ]);
    }
    reload();
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <MentorshipColumnSkeleton />
        <MentorshipColumnSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-danger bg-danger-light border border-danger/30 px-3 py-2 rounded-lg">
        {error.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 md:grid-cols-2">
        <MentorshipColumn
          title="Mentors"
          subtitle="Members who mentor this person"
          emptyText="No mentors assigned yet."
          addLabel="Add mentor"
          mentorships={mentors}
          memberId={memberId}
          getMember={getMember}
          availableMembers={availableMembers}
          onAdd={partnerId => handleAdd('mentor', partnerId)}
          onRemove={setConfirmDelete}
        />
        <MentorshipColumn
          title="Mentees"
          subtitle="Members this person mentors"
          emptyText="Not mentoring anyone yet."
          addLabel="Add mentee"
          mentorships={mentees}
          memberId={memberId}
          getMember={getMember}
          availableMembers={availableMembers}
          onAdd={partnerId => handleAdd('mentee', partnerId)}
          onRemove={setConfirmDelete}
        />
      </div>

      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove mentorship?"
        message={(() => {
          const m = mentorships?.find(x => x.id === confirmDelete);
          if (!m) return 'Remove this mentorship?';
          const otherId = m.mentor_id === memberId ? m.mentee_id : m.mentor_id;
          const role = m.mentor_id === memberId ? 'mentee' : 'mentor';
          const name = getMember(otherId)?.full_name ?? 'this member';
          return `Remove ${name} as ${role}?`;
        })()}
        description="The mentorship relationship will be deleted and logged in both members' change history. This cannot be undone."
        variant="danger"
        confirmLabel="Remove"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

interface MentorshipColumnProps {
  title: string;
  subtitle: string;
  emptyText: string;
  addLabel: string;
  mentorships: Mentorship[];
  memberId: string;
  getMember: (id: string) => Member | undefined;
  availableMembers: Member[];
  onAdd: (partnerId: string) => Promise<boolean>;
  onRemove: (id: string) => void;
}

function MentorshipColumn({
  title,
  subtitle,
  emptyText,
  addLabel,
  mentorships,
  memberId,
  getMember,
  availableMembers,
  onAdd,
  onRemove,
}: MentorshipColumnProps) {
  const [selected, setSelected] = useState('');
  const [busy, setBusy] = useState(false);

  const handleAdd = async () => {
    if (!selected) return;
    setBusy(true);
    const ok = await onAdd(selected);
    setBusy(false);
    if (ok) setSelected('');
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h3 className="font-serif text-lg text-ink flex items-center gap-2">
          {title}
          {mentorships.length > 0 && (
            <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-burgundy/10 text-burgundy text-xs font-semibold tabular-nums">
              {mentorships.length}
            </span>
          )}
        </h3>
        <p className="text-sm text-ink-light">{subtitle}</p>
      </div>

      {mentorships.length === 0 ? (
        <p className="text-sm text-ink-light italic">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {mentorships.map(m => {
            const otherId = m.mentor_id === memberId ? m.mentee_id : m.mentor_id;
            const partner = getMember(otherId);
            return (
              <li
                key={m.id}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg border border-line bg-white hover:bg-cream/40 hover:border-ink-light/30 transition-colors"
              >
                <Avatar name={partner?.full_name ?? '?'} size="sm" />
                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                  {partner ? (
                    <Link
                      to={`/members/${partner.id}`}
                      className="text-sm text-ink font-medium truncate hover:text-burgundy hover:underline focus-visible:outline-none focus-visible:underline"
                    >
                      {partner.full_name}
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-light italic truncate">Unknown member</span>
                  )}
                  <span className="text-xs text-ink-light tabular-nums">
                    Since {formatDate(m.start_date)}
                    {m.end_date && ` · Ended ${formatDate(m.end_date)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(m.id)}
                  aria-label={`Remove ${partner?.full_name ?? 'member'}`}
                  className="w-8 h-8 rounded-md text-ink-light hover:bg-danger-light hover:text-danger inline-flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
                >
                  <TrashIcon size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 pt-3 border-t border-cream-dark">
        <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-light">
          {addLabel}
        </span>
        <div className="flex gap-2 items-start">
          <div className="flex-1 min-w-0">
            <Select
              value={selected}
              onChange={e => setSelected(e.target.value)}
              options={availableMembers.map(m => ({ value: m.id, label: m.full_name }))}
              placeholder="Select a member"
              disabled={availableMembers.length === 0}
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={!selected || busy}
            loading={busy}
          >
            Add
          </Button>
        </div>
      </div>
    </section>
  );
}

function MentorshipColumnSkeleton() {
  return (
    <section role="status" aria-label="Loading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Skeleton height="22px" className="w-24" />
        <Skeleton height="13px" className="w-48" />
      </div>
      <div className="flex flex-col gap-2">
        {Array.from({ length: 2 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-line bg-white">
            <Skeleton width="32px" height="32px" rounded="full" />
            <div className="flex flex-col gap-1 flex-1">
              <Skeleton height="13px" className="w-1/2" />
              <Skeleton height="11px" className="w-1/3" />
            </div>
          </div>
        ))}
      </div>
      <div className="pt-3 border-t border-cream-dark flex flex-col gap-2">
        <Skeleton height="11px" className="w-20" />
        <div className="flex gap-2">
          <Skeleton height="38px" className="flex-1" />
          <Skeleton height="38px" width="64px" />
        </div>
      </div>
    </section>
  );
}
