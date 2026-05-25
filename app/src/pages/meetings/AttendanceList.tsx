import { useMemo, useState } from 'react';
import { Avatar, SearchIcon, TextInput } from '../../components/ui';
import { useMembers } from '../../contexts/MemberContext';
import { useToast } from '../../contexts/ToastContext';
import { upsertAttendance } from '../../lib/api/meetings';
import { useDebounce } from '../../hooks/useDebounce';
import { APOLOGY_NOTE } from '../../lib/constants';
import type { MeetingAttendance } from '../../types';

interface AttendanceListProps {
  meetingId: string;
  attendance: MeetingAttendance[];
  onChange: () => void;
}

type AttendanceState = 'attended' | 'apology' | null;

function getState(record: MeetingAttendance | undefined): AttendanceState {
  if (!record) return null;
  if (record.attended) return 'attended';
  if (record.notes === APOLOGY_NOTE) return 'apology';
  return null;
}

export function AttendanceList({ meetingId, attendance, onChange }: AttendanceListProps) {
  const { members } = useMembers();
  const { notify } = useToast();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search);
  const [busyId, setBusyId] = useState<string | null>(null);

  const byMember = useMemo(() => {
    const map = new Map<string, MeetingAttendance>();
    attendance.forEach(a => map.set(a.member_id, a));
    return map;
  }, [attendance]);

  const activeMembers = useMemo(
    () => members.filter(m => !m.exit_date),
    [members],
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (q === '') return activeMembers;
    return activeMembers.filter(m => m.full_name.toLowerCase().includes(q));
  }, [activeMembers, debouncedSearch]);

  const setStateFor = async (memberId: string, target: AttendanceState) => {
    setBusyId(memberId);
    const existing = byMember.get(memberId);
    const current = getState(existing);
    const next = current === target ? null : target;
    const result = await upsertAttendance({
      ...(existing ? { id: existing.id } : {}),
      meeting_id: meetingId,
      member_id: memberId,
      attended: next === 'attended',
      attendance_type: next === 'attended' ? 'In Person' : null,
      notes: next === 'apology' ? APOLOGY_NOTE : null,
    });
    setBusyId(null);
    if (!result.ok) {
      const name = members.find(m => m.id === memberId)?.full_name ?? 'member';
      notify(`Failed to update attendance for ${name}`, 'error');
    } else {
      onChange();
    }
  };

  const { attendedCount, apologyCount, unmarkedCount } = useMemo(() => {
    let attended = 0;
    let apology = 0;
    for (const member of activeMembers) {
      const state = getState(byMember.get(member.id));
      if (state === 'attended') attended++;
      else if (state === 'apology') apology++;
    }
    return {
      attendedCount: attended,
      apologyCount: apology,
      unmarkedCount: activeMembers.length - attended - apology,
    };
  }, [activeMembers, byMember]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <TextInput
          placeholder="Search members…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          leadingIcon={<SearchIcon size={16} />}
          className="flex-1 min-w-[220px]"
        />
        <div className="flex items-center gap-4 text-sm">
          <span className="text-success"><span className="font-semibold">{attendedCount}</span> attended</span>
          <span className="text-danger"><span className="font-semibold">{apologyCount}</span> {apologyCount === 1 ? 'apology' : 'apologies'}</span>
          <span className="text-ink-mid"><span className="font-semibold text-ink">{unmarkedCount}</span> unmarked</span>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-cream-dark/60">
        {filtered.map(m => {
          const state = getState(byMember.get(m.id));
          const isBusy = busyId === m.id;
          return (
            <li key={m.id} className="flex items-center justify-between gap-3 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={m.full_name} size="sm" />
                <div className="min-w-0">
                  <div className="text-sm text-ink font-medium truncate">{m.full_name}</div>
                  <div className="text-xs text-ink-light truncate">{m.email ?? '—'}</div>
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setStateFor(m.id, 'attended')}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors disabled:opacity-50 ${state === 'attended' ? 'bg-success text-white border-success' : 'border-cream-dark text-ink-mid hover:border-success/50 hover:text-success'}`}
                >
                  ✓ Attended
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => setStateFor(m.id, 'apology')}
                  className={`text-xs px-2.5 py-1 rounded border transition-colors disabled:opacity-50 ${state === 'apology' ? 'bg-danger text-white border-danger' : 'border-cream-dark text-ink-mid hover:border-danger/50 hover:text-danger'}`}
                >
                  ✗ Apology
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
