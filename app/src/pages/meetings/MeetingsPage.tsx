import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useMeetings } from '../../contexts/MeetingContext';
import {
  Button, CalendarIcon, Card, CardSkeleton, CardToolbar, CheckCircleIcon, EditIcon, EmptyState, HandshakeIcon, PageHeader, Pagination, PlusIcon, RepeatIcon, SearchIcon, Select, StarIcon, StatCard, StatCardGridSkeleton, TextInput, UserPlusIcon, XIcon,
} from '../../components/ui';
import { INPUT_BASE } from '../../components/ui/styles';
import { formatMonthDay } from '../../lib/format';
import { useDebounce } from '../../hooks/useDebounce';
import { useAsync } from '../../hooks/useAsync';
import { parseGuestList, splitNotesAndGuests } from './meetingSchema';
import { listMeetingSummaries, MeetingSummary } from '../../lib/api/meetings';
import type { Meeting } from '../../types';

const PAGE_SIZE = 5;

const MEETING_CARD_CLASS = [
  'flex items-center gap-4 px-4 py-3 bg-white border border-line rounded-xl shadow-soft text-inherit no-underline',
  'transition-all hover:border-burgundy/30 hover:shadow-pop',
].join(' ');

const STAT_TONE = {
  default: 'text-ink-mid',
  success: 'text-success',
  danger: 'text-danger',
} as const;

type IconComponent = (props: { size?: number; className?: string }) => JSX.Element;

function Stat({
  value, label, tone = 'default', icon: Icon,
}: { value: number; label: string; tone?: keyof typeof STAT_TONE; icon: IconComponent }) {
  const valueColor = tone === 'default' ? 'text-ink' : '';
  return (
    <span className={`flex items-center gap-1.5 ${STAT_TONE[tone]}`}>
      <Icon size={14} />
      <span className={`font-semibold ${valueColor}`}>{value}</span> {label}
    </span>
  );
}

function countGuests(notes: string | null): number {
  const { guestList } = splitNotesAndGuests(notes);
  return parseGuestList(guestList).length;
}

function MeetingCard({ meeting, summary }: { meeting: Meeting; summary?: MeetingSummary }) {
  const { day, month, year } = formatMonthDay(meeting.meeting_date);
  const guestCount = countGuests(meeting.notes);
  const weekday = new Date(meeting.meeting_date).toLocaleDateString(undefined, { weekday: 'long' });
  const statusColor = meeting.status === 'Published' ? 'text-success' : 'text-warning';

  return (
    <Link to={`/meetings/${meeting.id}`} className={MEETING_CARD_CLASS}>
      <div className="w-14 shrink-0 bg-burgundy text-white rounded-md py-1.5 text-center">
        <div className="text-[10px] uppercase tracking-wider opacity-90 leading-none">{month}</div>
        <div className="font-serif text-xl leading-tight">{day}</div>
        <div className="text-[10px] opacity-70 leading-none">{year}</div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col">
        <h3 className="font-serif text-lg text-ink truncate leading-tight">
          {meeting.title ?? 'Untitled meeting'}
        </h3>
        <span className="text-xs text-ink-light">{weekday}</span>
      </div>

      {summary && (
        <div className="hidden lg:flex items-center gap-5 text-sm text-ink-mid shrink-0">
          <Stat icon={HandshakeIcon} value={summary.rolesAssigned} label="roles" />
          <Stat icon={CheckCircleIcon} value={summary.attended} label="attended" tone="success" />
          <Stat icon={XIcon} value={summary.apologies} label={summary.apologies === 1 ? 'apology' : 'apologies'} tone="danger" />
          <Stat icon={UserPlusIcon} value={guestCount} label={guestCount === 1 ? 'guest' : 'guests'} />
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-4 text-[11px] font-semibold uppercase tracking-wider shrink-0 sm:pl-2">
        <span className="flex items-center gap-1.5 text-burgundy" title={meeting.meeting_type}>
          {meeting.meeting_type === 'Special' ? <StarIcon size={13} /> : <RepeatIcon size={13} />}
          <span className="hidden sm:inline">{meeting.meeting_type}</span>
        </span>
        <span className={`flex items-center gap-1.5 ${statusColor}`} title={meeting.status}>
          {meeting.status === 'Published' ? <CheckCircleIcon size={13} /> : <EditIcon size={13} />}
          <span className="hidden sm:inline">{meeting.status}</span>
        </span>
      </div>
    </Link>
  );
}

export function MeetingsPage() {
  const { meetings, loading } = useMeetings();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, typeFilter, statusFilter, dateFrom, dateTo]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      total: meetings.length,
      upcoming: meetings.filter(m => m.meeting_date >= today).length,
      published: meetings.filter(m => m.status === 'Published').length,
      drafts: meetings.filter(m => m.status === 'Draft').length,
    };
  }, [meetings]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return meetings.filter(m => {
      if (typeFilter && m.meeting_type !== typeFilter) return false;
      if (statusFilter && m.status !== statusFilter) return false;
      if (dateFrom && m.meeting_date < dateFrom) return false;
      if (dateTo && m.meeting_date > dateTo) return false;
      if (q && !(m.title ?? '').toLowerCase().includes(q)) return false;
      return true;
    });
  }, [meetings, debouncedSearch, typeFilter, statusFilter, dateFrom, dateTo]);

  const hasActiveFilters = !!(debouncedSearch || typeFilter || statusFilter || dateFrom || dateTo);
  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setDateFrom('');
    setDateTo('');
  };

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const groupedPage = useMemo(() => {
    const groups: { key: string; label: string; meetings: Meeting[] }[] = [];
    for (const meeting of paginated) {
      const date = new Date(meeting.meeting_date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      const last = groups[groups.length - 1];
      if (last && last.key === key) {
        last.meetings.push(meeting);
      } else {
        groups.push({ key, label, meetings: [meeting] });
      }
    }
    return groups;
  }, [paginated]);

  const paginatedIds = useMemo(() => paginated.map(m => m.id), [paginated]);
  const idsKey = paginatedIds.join(',');
  const summariesQuery = useAsync(
    () => listMeetingSummaries(paginatedIds),
    [idsKey],
  );
  const summaries = summariesQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Meeting Records"
        description="All club meetings — past and upcoming"
        actions={
          meetings.length > 0
            ? <Button onClick={() => navigate('/meetings/new')} icon={<PlusIcon size={16} />}>New meeting</Button>
            : null
        }
      />

      {loading ? (
        <StatCardGridSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total meetings" value={stats.total} />
          <StatCard label="Upcoming" value={stats.upcoming} variant="success" />
          <StatCard label="Published" value={stats.published} variant="info" />
          <StatCard label="Drafts" value={stats.drafts} variant="warning" />
        </div>
      )}

      <Card>
        <CardToolbar>
          <div className="flex-1 min-w-[220px]">
            <TextInput
              placeholder="Search by title…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              leadingIcon={<SearchIcon size={16} />}
            />
          </div>
          <Select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            options={[{ value: 'Regular', label: 'Regular' }, { value: 'Special', label: 'Special' }]}
            placeholder="All types"
          />
          <Select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            options={[{ value: 'Draft', label: 'Draft' }, { value: 'Published', label: 'Published' }]}
            placeholder="All statuses"
          />
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              aria-label="From date"
              value={dateFrom}
              max={dateTo || undefined}
              onChange={e => setDateFrom(e.target.value)}
              className={INPUT_BASE}
            />
            <span className="text-xs text-ink-light">to</span>
            <input
              type="date"
              aria-label="To date"
              value={dateTo}
              min={dateFrom || undefined}
              onChange={e => setDateTo(e.target.value)}
              className={INPUT_BASE}
            />
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} icon={<XIcon size={14} />}>
              Clear
            </Button>
          )}
        </CardToolbar>

        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} lines={2} withAvatar />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarIcon size={40} />}
            title="No meetings"
            description={meetings.length === 0
              ? 'Schedule your first meeting to get started.'
              : 'Try clearing filters.'}
            action={meetings.length === 0 && (
              <Button onClick={() => navigate('/meetings/new')}>New meeting</Button>
            )}
          />
        ) : (
          <>
            <div className="p-5 flex flex-col gap-5">
              {groupedPage.map(group => (
                <div key={group.key} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-mid shrink-0">
                      {group.label}
                    </h4>
                    <span className="text-xs text-ink-light">
                      {group.meetings.length} {group.meetings.length === 1 ? 'meeting' : 'meetings'}
                    </span>
                    <div className="flex-1 h-px bg-cream-dark/60" />
                  </div>
                  <div className="flex flex-col gap-3">
                    {group.meetings.map(m => (
                      <MeetingCard key={m.id} meeting={m} summary={summaries?.get(m.id)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {filtered.length > PAGE_SIZE && (
              <div className="px-5 pb-5 pt-2 border-t border-cream-dark/60">
                <Pagination
                  page={page}
                  pageSize={PAGE_SIZE}
                  total={filtered.length}
                  onChange={setPage}
                  itemLabel="meetings"
                />
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
