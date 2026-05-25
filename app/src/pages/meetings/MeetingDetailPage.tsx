import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAsync } from '../../hooks/useAsync';
import { useMeetings } from '../../contexts/MeetingContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Button, CalendarIcon, CardSkeleton, Card, CardBody, CheckCircleIcon, ConfirmDialog, EditIcon, EmptyState, FileTextIcon, HandshakeIcon, PageHeader, RepeatIcon, SearchIcon, StarIcon, TableSkeleton, Tabs, UserPlusIcon,
} from '../../components/ui';
import { listAttendance, listMeetingRoles } from '../../lib/api/meetings';
import { formatDateLong } from '../../lib/format';
import { parseGuestList, splitNotesAndGuests } from './meetingSchema';
import { RolesView } from './RolesView';
import { AttendanceList } from './AttendanceList';

type TabKey = 'roles' | 'attendance' | 'notes' | 'guests';

export function MeetingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMeeting, deleteMeeting, loading: meetingsLoading } = useMeetings();
  const { notify } = useToast();
  const [tab, setTab] = useState<TabKey>('roles');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const meeting = id ? getMeeting(id) : undefined;

  const rolesQuery = useAsync(
    () => meeting ? listMeetingRoles(meeting.id) : Promise.resolve({ ok: true as const, data: [] }),
    [meeting?.id],
  );
  const attendanceQuery = useAsync(
    () => meeting ? listAttendance(meeting.id) : Promise.resolve({ ok: true as const, data: [] }),
    [meeting?.id],
  );

  if (meetingsLoading && !meeting) {
    return (
      <div className="flex flex-col gap-3">
        <CardSkeleton lines={3} />
        <TableSkeleton rows={5} columns={3} showHeader={false} />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          icon={<SearchIcon size={40} />}
          title="Meeting not found"
          action={<Button onClick={() => navigate('/meetings')}>Back to meetings</Button>}
        />
      </div>
    );
  }

  const handleDelete = async () => {
    const ok = await deleteMeeting(meeting.id);
    if (ok) {
      const label = meeting.title?.trim() ? `"${meeting.title}"` : `Meeting on ${meeting.meeting_date}`;
      notify(`Meeting ${label} deleted`);
      navigate('/meetings');
    } else {
      notify('Failed to delete meeting. Try again.', 'error');
    }
  };

  const assignedRoles = (rolesQuery.data ?? []).filter(r => r.member_id).length;
  const present = (attendanceQuery.data ?? []).filter(a => a.attended).length;
  const statusColor = meeting.status === 'Published' ? 'text-success' : 'text-warning';
  const { notes: noteText, guestList } = splitNotesAndGuests(meeting.notes);
  const guests = parseGuestList(guestList);

  return (
    <div className="flex flex-col gap-6">
      <button
        type="button"
        onClick={() => navigate('/meetings')}
        className="flex items-center gap-1.5 text-sm text-ink-light hover:text-ink transition-colors w-fit"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Back to Meetings
      </button>

      <PageHeader
        title={meeting.title ?? 'Untitled meeting'}
        description={formatDateLong(meeting.meeting_date)}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={() => navigate(`/meetings/${meeting.id}/edit`)}>Edit</Button>
            <Button variant="danger" onClick={() => setConfirmDelete(true)}>Delete</Button>
          </div>
        }
      />

      <Card>
        <CardBody className="flex items-center gap-4 flex-wrap text-[11px] font-semibold uppercase tracking-wider">
          <span className="flex items-center gap-1.5 text-burgundy">
            {meeting.meeting_type === 'Special' ? <StarIcon size={13} /> : <RepeatIcon size={13} />}
            {meeting.meeting_type}
          </span>
          <span className={`flex items-center gap-1.5 ${statusColor}`}>
            {meeting.status === 'Published' ? <CheckCircleIcon size={13} /> : <EditIcon size={13} />}
            {meeting.status}
          </span>
        </CardBody>
      </Card>

      <Card>
        <Tabs
          items={[
            { key: 'roles', label: 'Roles', count: assignedRoles, icon: <HandshakeIcon size={16} /> },
            { key: 'attendance', label: 'Attendance', count: present, icon: <CalendarIcon size={16} /> },
            { key: 'notes', label: 'Notes', icon: <FileTextIcon size={16} /> },
            { key: 'guests', label: 'Guests', count: guests.length, icon: <UserPlusIcon size={16} /> },
          ]}
          active={tab}
          onChange={k => setTab(k as TabKey)}
        />
        <CardBody>
          {tab === 'roles' && (
            rolesQuery.loading ? (
              <TableSkeleton rows={5} columns={3} showHeader={false} />
            ) : (
              <RolesView roles={rolesQuery.data ?? []} />
            )
          )}
          {tab === 'attendance' && (
            attendanceQuery.loading ? (
              <TableSkeleton rows={5} columns={3} showHeader={false} />
            ) : (
              <AttendanceList
                meetingId={meeting.id}
                attendance={attendanceQuery.data ?? []}
                onChange={attendanceQuery.reload}
              />
            )
          )}
          {tab === 'notes' && (
            noteText
              ? <p className="whitespace-pre-wrap text-sm text-ink-mid">{noteText}</p>
              : <p className="text-sm text-ink-light italic">No notes for this meeting.</p>
          )}
          {tab === 'guests' && (
            guests.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {guests.map((g, i) => (
                  <li key={i} className="text-sm text-ink bg-cream px-3 py-1 rounded-full border border-cream-dark/60">
                    {g}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-ink-light italic">No guests for this meeting.</p>
            )
          )}
        </CardBody>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete meeting?"
        message={`Delete "${meeting.title ?? `meeting on ${meeting.meeting_date}`}"? This action cannot be undone.`}
        description={`${assignedRoles} role ${assignedRoles === 1 ? 'assignment' : 'assignments'} and ${(attendanceQuery.data ?? []).length} attendance ${(attendanceQuery.data ?? []).length === 1 ? 'record' : 'records'} will be removed.`}
        variant="danger"
        confirmLabel="Delete meeting"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
