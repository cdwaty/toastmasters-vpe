import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { useMembers } from '../../contexts/MemberContext';
import { useReferenceData } from '../../contexts/ReferenceDataContext';
import { useToast } from '../../contexts/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import {
  Button, Card, EditIcon, EmptyState, PageHeader, Pagination, PlusIcon,
  UsersIcon,
} from '../../components/ui';
import { useDebounce } from '../../hooks/useDebounce';
import { listAllPathways } from '../../lib/api/pathways';
import { mergeLocations } from '../../utils/locations';
import type { Member, Pathway } from '../../types';
import { RosterStatsRow } from './roster/RosterStatsRow';
import { RosterFilters, type RosterFilterState } from './roster/RosterFilters';
import { MembersTable, type SortDir, type SortKey } from './roster/MembersTable';
import { DeleteMemberDialog } from './roster/DeleteMemberDialog';

const PAGE_SIZE = 15;

function compare(a: Member, b: Member, key: SortKey, dir: SortDir): number {
  const av = a[key] ?? '';
  const bv = b[key] ?? '';
  const cmp = String(av).localeCompare(String(bv));
  return dir === 'asc' ? cmp : -cmp;
}

const INITIAL_FILTERS: RosterFilterState = {
  search: '',
  typeFilter: '',
  locationFilter: '',
  clubFilter: '',
  showInactive: false,
};

export function RosterPage() {
  const { members, loading, deleteMember } = useMembers();
  const { pathwayTypes } = useReferenceData();
  const { notify } = useToast();
  const pathwaysQuery = useAsync(() => listAllPathways(), []);
  const navigate = useNavigate();

  const [filters, setFilters] = useState<RosterFilterState>(INITIAL_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('full_name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pendingDelete, setPendingDelete] = useState<Member | null>(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search);

  const pathwayNameById = useMemo(
    () => new Map(pathwayTypes.map(pt => [pt.id, pt.pathway_name])),
    [pathwayTypes],
  );

  const pathwaysByMember = useMemo(() => {
    const map = new Map<string, Pathway[]>();
    for (const pathway of pathwaysQuery.data ?? []) {
      const list = map.get(pathway.member_id) ?? [];
      list.push(pathway);
      map.set(pathway.member_id, list);
    }
    return map;
  }, [pathwaysQuery.data]);

  const stats = useMemo(() => ({
    active: members.filter(m => !m.exit_date).length,
    internal: members.filter(m => m.member_type === 'Internal').length,
    external: members.filter(m => m.member_type === 'External').length,
    inactive: members.filter(m => m.exit_date).length,
  }), [members]);

  const locationOptions = useMemo(
    () => mergeLocations(members.map(m => m.location)).map(loc => ({ value: loc, label: loc })),
    [members],
  );

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return members.filter(m => {
      if (!filters.showInactive && m.exit_date) return false;
      if (filters.typeFilter && m.member_type !== filters.typeFilter) return false;
      if (filters.locationFilter && (m.location ?? '').trim() !== filters.locationFilter) return false;
      if (filters.clubFilter && m.club_preference !== filters.clubFilter) return false;
      if (!q) return true;
      const haystack = [m.full_name, m.email, m.phone, m.location, ...(m.aliases ?? [])]
        .filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [members, debouncedSearch, filters]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => compare(a, b, sortKey, sortDir)),
    [filtered, sortKey, sortDir],
  );

  const paged = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  const handleFiltersChange = (patch: Partial<RosterFilterState>) => {
    setFilters(prev => ({ ...prev, ...patch }));
    setPage(1);
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    const ok = await deleteMember(pendingDelete.id);
    setDeleting(false);
    if (ok) notify(`Member ${pendingDelete.full_name} deleted`);
    else notify(`Failed to delete ${pendingDelete.full_name}`, 'error');
    setPendingDelete(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Membership Records"
        description="Manage and view all club members"
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate('/members/bulk')} icon={<EditIcon size={16} />}>
              Bulk Update
            </Button>
            <Button onClick={() => navigate('/members/add')} icon={<PlusIcon size={16} />}>
              New Member
            </Button>
          </>
        }
      />

      <RosterStatsRow stats={stats} loading={loading} />

      <Card>
        <RosterFilters state={filters} locationOptions={locationOptions} onChange={handleFiltersChange} />

        {!loading && sorted.length === 0 ? (
          <EmptyState
            icon={<UsersIcon size={40} />}
            title="No members yet"
            description={members.length === 0
              ? 'Add your first member to get started'
              : 'Try clearing filters or searching with a different term.'}
            action={members.length === 0 && (
              <Button onClick={() => navigate('/members/add')}>New Member</Button>
            )}
          />
        ) : (
          <>
            <MembersTable
              members={paged}
              pathwaysByMember={pathwaysByMember}
              pathwayNameById={pathwayNameById}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={handleSort}
              onDelete={setPendingDelete}
              loading={loading}
              skeletonRows={PAGE_SIZE}
            />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={sorted.length}
              onChange={setPage}
              itemLabel="member"
              hideWhenSinglePage={false}
            />
          </>
        )}
      </Card>

      <DeleteMemberDialog
        member={pendingDelete}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
