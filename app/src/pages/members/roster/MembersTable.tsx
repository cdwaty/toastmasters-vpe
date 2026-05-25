import { Link, useNavigate } from 'react-router';
import {
  Avatar, Badge, EditIcon, Table, TableBodySkeleton, TableCell, TableHead, TableHeaderCell, TableRow, TableWrap, TrashIcon,
} from '../../../components/ui';
import { formatDate } from '../../../lib/format';
import type { Member, Pathway } from '../../../types';

export type SortKey = 'full_name' | 'paid_until' | 'location' | 'club_preference' | 'join_date' | 'exit_date';
export type SortDir = 'asc' | 'desc';

interface MembersTableProps {
  members: Member[];
  pathwaysByMember: Map<string, Pathway[]>;
  pathwayNameById: Map<string, string>;
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
  onDelete: (member: Member) => void;
  loading?: boolean;
  skeletonRows?: number;
}

const COLUMN_COUNT = 8;

function memberStatus(m: Member): 'Active' | 'Inactive' {
  return m.exit_date ? 'Inactive' : 'Active';
}

function pathwayInitials(name: string): string {
  return name.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).join('');
}

export function MembersTable({
  members, pathwaysByMember, pathwayNameById, sortKey, sortDir, onSort, onDelete, loading, skeletonRows = 10,
}: MembersTableProps) {
  const navigate = useNavigate();
  const sortIcon = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : null;

  return (
    <TableWrap>
      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell sortable onClick={() => onSort('full_name')} sortIcon={sortIcon('full_name')}>Name</TableHeaderCell>
            <TableHeaderCell sortable onClick={() => onSort('paid_until')} sortIcon={sortIcon('paid_until')}>Paid until</TableHeaderCell>
            <TableHeaderCell sortable onClick={() => onSort('location')} sortIcon={sortIcon('location')}>Location</TableHeaderCell>
            <TableHeaderCell sortable onClick={() => onSort('club_preference')} sortIcon={sortIcon('club_preference')}>Club</TableHeaderCell>
            <TableHeaderCell>Pathway(s)</TableHeaderCell>
            <TableHeaderCell sortable onClick={() => onSort('join_date')} sortIcon={sortIcon('join_date')}>Joined</TableHeaderCell>
            <TableHeaderCell sortable onClick={() => onSort('exit_date')} sortIcon={sortIcon('exit_date')}>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </tr>
        </TableHead>
        {loading ? (
          <TableBodySkeleton rows={skeletonRows} columns={COLUMN_COUNT} showAvatar />
        ) : (
        <tbody>
          {members.map(m => {
            const memberPathways = pathwaysByMember.get(m.id) ?? [];
            return (
              <TableRow key={m.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar name={m.full_name} size="sm" />
                    <div className="min-w-0">
                      <Link to={`/members/${m.id}`} className="font-medium text-ink hover:text-burgundy">
                        {m.full_name}
                      </Link>
                      <div className="text-xs text-ink-light truncate">{m.email ?? m.phone ?? '—'}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(m.paid_until)}</TableCell>
                <TableCell>{m.location ?? '—'}</TableCell>
                <TableCell>
                  {m.club_preference ? (
                    <Badge tone={m.club_preference === 'Yarning Circle' ? 'yarning' : 'tahi'}>
                      {m.club_preference}
                    </Badge>
                  ) : '—'}
                </TableCell>
                <TableCell>
                  {memberPathways.length === 0 ? (
                    <span className="text-ink-light">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {memberPathways.map(p => {
                        const name = pathwayNameById.get(p.pathway_type_id) ?? '?';
                        return (
                          <Badge key={p.id} tone="info">
                            {pathwayInitials(name)}{p.current_level}
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </TableCell>
                <TableCell>{formatDate(m.join_date)}</TableCell>
                <TableCell>
                  <Badge tone={m.exit_date ? 'neutral' : 'success'}>{memberStatus(m)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => navigate(`/members/${m.id}`)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-cream text-ink-mid hover:text-burgundy transition-colors"
                      aria-label={`Edit ${m.full_name}`}
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(m)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-danger-light text-ink-mid hover:text-danger transition-colors"
                      aria-label={`Delete ${m.full_name}`}
                      title="Delete"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
        )}
      </Table>
    </TableWrap>
  );
}
