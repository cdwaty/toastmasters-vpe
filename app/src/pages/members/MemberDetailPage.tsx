import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useMembers } from '../../contexts/MemberContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Avatar, Badge, Button, Card, CardBody, EmptyState, HandshakeIcon, MapPinIcon, RouteIcon, SearchIcon, Spinner, Tabs, UsersIcon,
} from '../../components/ui';
import { MemberForm } from './MemberForm';
import { HistoryCard } from './HistoryCard';
import { PathwaysTab } from './pathways/PathwaysTab';
import { MentorshipTab } from './MentorshipTab';
import { formatDate } from '../../lib/format';
import { useAsync } from '../../hooks/useAsync';
import { countAttendanceForMember } from '../../lib/api/meetings';

type TabKey = 'profile' | 'pathways' | 'mentorship';

function MetaItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <dt className="text-[11px] uppercase tracking-caps text-ink-light font-semibold">
        {label}
      </dt>
      <dd className="text-ink text-sm truncate flex items-center gap-1.5">
        {icon && <span className="text-ink-light shrink-0">{icon}</span>}
        <span className="truncate">{value}</span>
      </dd>
    </div>
  );
}

export function MemberDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMember, updateMember, loading: membersLoading } = useMembers();
  const { notify } = useToast();
  const [tab, setTab] = useState<TabKey>('profile');
  const [historyVersion, setHistoryVersion] = useState(0);

  const member = id ? getMember(id) : undefined;

  const attendanceCount = useAsync(
    () => member ? countAttendanceForMember(member.id) : Promise.resolve({ ok: true as const, data: 0 }),
    [member?.id],
  );

  if (membersLoading && !member) {
    return (
      <div className="flex justify-center p-10">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col gap-6">
        <EmptyState
          icon={<SearchIcon size={40} />}
          title="Member not found"
          description="The member you are looking for does not exist or has been deleted."
          action={<Button onClick={() => navigate('/members')}>Back to roster</Button>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => navigate('/members')}>← Back</Button>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Avatar name={member.full_name} size="lg" />
          <div className="flex flex-col gap-4 flex-1 min-w-0">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-serif text-2xl text-ink leading-tight">{member.full_name}</h1>
              {(member.email || member.phone) && (
                <div className="text-sm text-ink-light truncate">
                  {member.email ?? member.phone}
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                {member.member_type && (
                  <Badge tone={member.member_type === 'External' ? 'warning' : 'info'}>{member.member_type}</Badge>
                )}
                {member.club_preference && (
                  <Badge tone={member.club_preference === 'Yarning Circle' ? 'yarning' : 'tahi'}>{member.club_preference}</Badge>
                )}
                <Badge tone={member.exit_date ? 'neutral' : 'success'}>
                  {member.exit_date ? 'Inactive' : 'Active'}
                </Badge>
                {member.education_award && <Badge tone="info">{member.education_award}</Badge>}
              </div>
            </div>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 pt-3 border-t border-cream-dark">
              <MetaItem label="Joined" value={formatDate(member.join_date)} />
              <MetaItem label="Paid until" value={formatDate(member.paid_until)} />
              <MetaItem label="Location" value={member.location ?? '—'} icon={<MapPinIcon size={14} />} />
              <MetaItem
                label="Meetings attended"
                value={attendanceCount.loading ? '…' : String(attendanceCount.data ?? 0)}
              />
            </dl>
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] items-start">
        <Card>
          <Tabs
            items={[
              { key: 'profile', label: 'Profile', icon: <UsersIcon size={16} /> },
              { key: 'pathways', label: 'Pathways', icon: <RouteIcon size={16} /> },
              { key: 'mentorship', label: 'Mentorship', icon: <HandshakeIcon size={16} /> },
            ]}
            active={tab}
            onChange={k => setTab(k as TabKey)}
          />
          <CardBody>
            {tab === 'profile' && (
              <MemberForm
                initialValues={member}
                submitLabel="Save changes"
                onSubmit={async values => {
                  const updated = await updateMember(member.id, values);
                  if (updated) {
                    notify(`Member ${updated.full_name} updated`);
                    setHistoryVersion(v => v + 1);
                  } else {
                    notify(`Failed to update ${member.full_name}`, 'error');
                  }
                }}
              />
            )}
            {tab === 'pathways' && <PathwaysTab memberId={member.id} />}
            {tab === 'mentorship' && <MentorshipTab memberId={member.id} />}
          </CardBody>
        </Card>
        <HistoryCard memberId={member.id} reloadKey={historyVersion} />
      </div>
    </div>
  );
}
