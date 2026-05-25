import { memo, useMemo } from 'react';
import { Card, CardBody } from '../../components/ui';
import type { Member } from '../../types';
import type { AttendanceMap } from './meetingFormHelpers';

interface Props {
  activeMembers: Member[];
  attendance: AttendanceMap;
  toggleAttendance: (memberId: string, target: 'attended' | 'apology') => void;
}

function AttendanceSidebarImpl({ activeMembers, attendance, toggleAttendance }: Props) {
  const { attendedCount, apologyCount, unmarkedCount } = useMemo(() => {
    let attended = 0;
    let apology = 0;
    for (const m of activeMembers) {
      const state = attendance[m.id] ?? null;
      if (state === 'attended') attended++;
      else if (state === 'apology') apology++;
    }
    return {
      attendedCount: attended,
      apologyCount: apology,
      unmarkedCount: activeMembers.length - attended - apology,
    };
  }, [activeMembers, attendance]);

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div>
          <h3 className="font-serif text-lg text-ink">Attendance</h3>
          <p className="text-xs text-ink-light mt-0.5">Mark each member's status for this meeting</p>
        </div>
        <ul className="flex flex-col divide-y divide-cream-dark/60">
          {activeMembers.map(m => {
            const state = attendance[m.id] ?? null;
            return (
              <li key={m.id} className="flex items-center justify-between gap-2 py-2">
                <span className="text-sm text-ink truncate">{m.full_name}</span>
                <div className="flex gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleAttendance(m.id, 'attended')}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${state === 'attended' ? 'bg-success text-white border-success' : 'border-cream-dark text-ink-mid hover:border-success/50 hover:text-success'}`}
                  >
                    ✓ Attended
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleAttendance(m.id, 'apology')}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${state === 'apology' ? 'bg-danger text-white border-danger' : 'border-cream-dark text-ink-mid hover:border-danger/50 hover:text-danger'}`}
                  >
                    ✗ Apology
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-ink-light pt-1 border-t border-cream-dark/60">
          <span className="text-success font-medium">{attendedCount}</span> attended ·{' '}
          <span className="text-danger font-medium">{apologyCount}</span> {apologyCount === 1 ? 'apology' : 'apologies'} ·{' '}
          <span className="text-ink-mid font-medium">{unmarkedCount}</span> unmarked
        </p>
      </CardBody>
    </Card>
  );
}

export const AttendanceSidebar = memo(AttendanceSidebarImpl);
