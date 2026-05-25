import { ReactNode, useMemo } from 'react';
import { Link } from 'react-router';
import {
  Avatar, Card, CardHeader, CardBody, CardSkeleton, EmptyState, CalendarIcon,
  CheckCircleIcon, PageHeader, StatCard, StatCardGridSkeleton,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useMembers } from '../contexts/MemberContext';
import { useMeetings } from '../contexts/MeetingContext';
import { formatDate, formatMonthDay } from '../lib/format';
import { routes } from '../lib/routes';
import type { Meeting, Member } from '../types';

const UPCOMING_LIMIT = 5;
const EXPIRING_WINDOW_DAYS = 30;
const SKELETON_ROW_COUNT = 3;
const EMPTY_ICON_SIZE = 36;
const STAT_CARD_COUNT = 4;
const MS_PER_DAY = 86_400_000;

const ROW_CLASS = [
  'flex items-center gap-4 px-4 py-3 bg-white border border-line rounded-xl text-inherit no-underline',
  'transition-all hover:border-burgundy/30 hover:shadow-pop',
].join(' ');

const VIEW_ALL_CLASS = 'text-sm font-semibold text-burgundy hover:underline';

function toLocalIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function pluralize(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}

function ViewAllLink({ to }: { to: string }) {
  return <Link to={to} className={VIEW_ALL_CLASS}>View all</Link>;
}

interface DashboardSectionProps<T> {
  title: string;
  description: string;
  viewAllHref: string;
  loading: boolean;
  items: T[];
  emptyIcon: ReactNode;
  emptyTitle: string;
  emptyDescription: string;
  renderItem: (item: T) => ReactNode;
  itemKey: (item: T) => string;
}

function DashboardSection<T>({
  title, description, viewAllHref, loading, items,
  emptyIcon, emptyTitle, emptyDescription, renderItem, itemKey,
}: DashboardSectionProps<T>) {
  return (
    <Card>
      <CardHeader actions={<ViewAllLink to={viewAllHref} />}>
        <div>
          <h3 className="font-serif text-lg text-ink">{title}</h3>
          <p className="text-xs text-ink-light mt-0.5">{description}</p>
        </div>
      </CardHeader>
      <CardBody>
        {loading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
              <CardSkeleton key={i} lines={2} withAvatar />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
        ) : (
          <div className="flex flex-col gap-3">
            {items.map(item => <div key={itemKey(item)}>{renderItem(item)}</div>)}
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function UpcomingMeetingRow({ meeting }: { meeting: Meeting }) {
  const { day, month, year } = formatMonthDay(meeting.meeting_date);
  const weekday = new Date(meeting.meeting_date).toLocaleDateString(undefined, { weekday: 'long' });
  const statusColor = meeting.status === 'Published' ? 'text-success' : 'text-warning';

  return (
    <Link to={routes.meetingDetail(meeting.id)} className={ROW_CLASS}>
      <div className="w-14 shrink-0 bg-burgundy text-white rounded-md py-1.5 text-center">
        <div className="text-[10px] uppercase tracking-wider opacity-90 leading-none">{month}</div>
        <div className="font-serif text-xl leading-tight">{day}</div>
        <div className="text-[10px] opacity-70 leading-none">{year}</div>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-lg text-ink truncate leading-tight">
          {meeting.title ?? 'Untitled meeting'}
        </h3>
        <span className="text-xs text-ink-light">{weekday} · {meeting.meeting_type}</span>
      </div>
      <span className={`text-[11px] font-semibold uppercase tracking-wider shrink-0 ${statusColor}`}>
        {meeting.status}
      </span>
    </Link>
  );
}

type AttentionReason = 'expired' | 'expiring';

interface MemberAttention {
  member: Member;
  reason: AttentionReason;
  daysUntil: number;
}

const REASON_STYLE: Record<AttentionReason, { label: string; badge: string }> = {
  expired: { label: 'Expired', badge: 'bg-danger/10 text-danger' },
  expiring: { label: 'Expiring', badge: 'bg-warning/10 text-warning' },
};

function buildAttentionList(members: Member[]): MemberAttention[] {
  const today = new Date();
  const todayIso = toLocalIsoDate(today);
  const horizon = new Date(today);
  horizon.setDate(horizon.getDate() + EXPIRING_WINDOW_DAYS);
  const horizonIso = toLocalIsoDate(horizon);

  return members
    .filter(m => !m.exit_date && m.paid_until)
    .map(m => {
      const paidUntil = m.paid_until as string;
      const daysUntil = Math.round((new Date(paidUntil).getTime() - today.getTime()) / MS_PER_DAY);
      if (paidUntil < todayIso) return { member: m, reason: 'expired' as const, daysUntil };
      if (paidUntil <= horizonIso) return { member: m, reason: 'expiring' as const, daysUntil };
      return null;
    })
    .filter((entry): entry is MemberAttention => entry !== null)
    .sort((a, b) => a.member.paid_until!.localeCompare(b.member.paid_until!));
}

function AttentionRow({ entry }: { entry: MemberAttention }) {
  const { member, reason, daysUntil } = entry;
  const style = REASON_STYLE[reason];
  let detail: string;
  if (daysUntil === 0) detail = 'today';
  else if (reason === 'expired') detail = `${pluralize(Math.abs(daysUntil), 'day')} ago`;
  else detail = `in ${pluralize(daysUntil, 'day')}`;

  return (
    <Link to={routes.memberDetail(member.id)} className={ROW_CLASS}>
      <Avatar name={member.full_name} />
      <div className="min-w-0 flex-1">
        <h3 className="font-serif text-base text-ink truncate leading-tight">{member.full_name}</h3>
        <span className="text-xs text-ink-light">
          Paid until {formatDate(member.paid_until)} · {detail}
        </span>
      </div>
      <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full shrink-0 ${style.badge}`}>
        {style.label}
      </span>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const { members, loading: membersLoading } = useMembers();
  const { meetings, loading: meetingsLoading } = useMeetings();

  const loading = membersLoading || meetingsLoading;
  const internal = members.filter(m => m.member_type === 'Internal').length;
  const external = members.filter(m => m.member_type === 'External').length;

  const attention = useMemo(() => buildAttentionList(members), [members]);

  const upcoming = useMemo(() => {
    const todayIso = toLocalIsoDate(new Date());
    return meetings
      .filter(m => m.meeting_date >= todayIso)
      .sort((a, b) => a.meeting_date.localeCompare(b.meeting_date))
      .slice(0, UPCOMING_LIMIT);
  }, [meetings]);

  const userName = user?.email?.split('@')[0] ?? '';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description={`Welcome back, ${userName}`} />

      {loading ? (
        <StatCardGridSkeleton count={STAT_CARD_COUNT} />
      ) : (
        <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
          <StatCard label="Members" value={members.length} />
          <StatCard label="Internal" value={internal} variant="info" />
          <StatCard label="External" value={external} variant="warning" />
          <StatCard label="Meetings" value={meetings.length} />
        </div>
      )}

      <DashboardSection
        title="Upcoming meetings"
        description="Next scheduled club meetings"
        viewAllHref={routes.meetings}
        loading={meetingsLoading}
        items={upcoming}
        emptyIcon={<CalendarIcon size={EMPTY_ICON_SIZE} />}
        emptyTitle="No upcoming meetings"
        emptyDescription="Schedule a meeting to see it here."
        itemKey={m => m.id}
        renderItem={m => <UpcomingMeetingRow meeting={m} />}
      />

      <DashboardSection
        title="Members needing attention"
        description={`Memberships expired or expiring in ${EXPIRING_WINDOW_DAYS} days`}
        viewAllHref={routes.members}
        loading={membersLoading}
        items={attention}
        emptyIcon={<CheckCircleIcon size={EMPTY_ICON_SIZE} />}
        emptyTitle="All members up to date"
        emptyDescription="No expiring or expired memberships."
        itemKey={entry => entry.member.id}
        renderItem={entry => <AttentionRow entry={entry} />}
      />
    </div>
  );
}
