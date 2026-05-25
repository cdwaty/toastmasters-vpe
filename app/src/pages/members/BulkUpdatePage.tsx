import { useId, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import clsx from 'clsx';
import { useMembers } from '../../contexts/MemberContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Avatar, Badge, BuildingIcon, Button, CardSkeleton, Card, CardBody, DollarIcon, DoorIcon, MapPinIcon, PageHeader, Select, TextInput,
} from '../../components/ui';
import type { ComponentType } from 'react';
import { INPUT_BASE } from '../../components/ui/styles';
import { useDebounce } from '../../hooks/useDebounce';
import { mergeLocations } from '../../utils/locations';
import type { ClubPreference, Member } from '../../types';

type BulkField = 'paid_until' | 'location' | 'club_preference' | 'exit_date';

interface FieldDef {
  value: BulkField;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const FIELDS: FieldDef[] = [
  { value: 'paid_until', label: 'Membership Paid Until', icon: DollarIcon },
  { value: 'location', label: 'Location', icon: MapPinIcon },
  { value: 'club_preference', label: 'Club Preference', icon: BuildingIcon },
  { value: 'exit_date', label: 'Exit Date', icon: DoorIcon },
];

function memberStatus(m: Member): 'Active' | 'Inactive' {
  return m.exit_date ? 'Inactive' : 'Active';
}

export function BulkUpdatePage() {
  const { members, bulkUpdate, loading } = useMembers();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [field, setField] = useState<BulkField>('paid_until');
  const [value, setValue] = useState<string>('');
  const [clearExitDate, setClearExitDate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebounce(search);

  const locationOptions = useMemo(
    () => mergeLocations(members.map(m => m.location)).map(loc => ({ value: loc, label: loc })),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    return members.filter(m => {
      if (!showInactive && m.exit_date) return false;
      if (typeFilter && m.member_type !== typeFilter) return false;
      if (locationFilter && (m.location ?? '').trim() !== locationFilter) return false;
      if (!q) return true;
      return m.full_name.toLowerCase().includes(q) || (m.email ?? '').toLowerCase().includes(q);
    });
  }, [members, debouncedSearch, typeFilter, locationFilter, showInactive]);

  const toggle = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedIds(new Set(filteredMembers.map(m => m.id)));
  const clearAll = () => setSelectedIds(new Set());

  const handleFieldChange = (newField: BulkField) => {
    setField(newField);
    setValue('');
    setClearExitDate(false);
  };

  const handleApply = async () => {
    if (selectedIds.size === 0) return;
    const patch: Partial<Member> = {};
    if (field === 'paid_until') patch.paid_until = value || null;
    else if (field === 'location') patch.location = value || null;
    else if (field === 'club_preference') patch.club_preference = (value || null) as ClubPreference | null;
    else if (field === 'exit_date') patch.exit_date = clearExitDate ? null : value || null;

    setSubmitting(true);
    const ok = await bulkUpdate(Array.from(selectedIds), patch);
    setSubmitting(false);
    if (ok) {
      const fieldLabel = FIELDS.find(f => f.value === field)?.label ?? field;
      notify(`Updated ${fieldLabel} for ${selectedIds.size} member${selectedIds.size === 1 ? '' : 's'}`);
      navigate('/members');
    } else {
      notify('Bulk update failed. Try again.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Members Bulk Update"
        description="Update one field across multiple members at once"
        actions={
          <Button variant="secondary" onClick={() => navigate('/members')}>← Back</Button>
        }
      />

      <Card>
        <CardBody className="flex flex-col gap-5">
          <h2 className="font-serif text-xl text-ink">Step 1 — Choose field to update</h2>
          <div className="flex flex-wrap gap-2">
            {FIELDS.map(f => {
              const Icon = f.icon;
              return (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => handleFieldChange(f.value)}
                  className={clsx(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                    field === f.value
                      ? 'bg-burgundy text-white border-burgundy'
                      : 'bg-white text-ink border-line hover:bg-cream',
                  )}
                >
                  <Icon size={16} />
                  {f.label}
                </button>
              );
            })}
          </div>

          <hr className="border-line" />

          <h2 className="font-serif text-xl text-ink">Step 2 — Set new value</h2>
          <ValueInput
            field={field}
            value={value}
            onChange={setValue}
            clearExitDate={clearExitDate}
            onClearExitDateChange={setClearExitDate}
            locationOptions={locationOptions}
          />
        </CardBody>
      </Card>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="font-serif text-xl text-ink">Step 3 — Select members</h2>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={selectAll}>Select All</Button>
              <Button variant="secondary" onClick={clearAll}>Clear</Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <TextInput
                placeholder="Search name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="min-w-[160px]">
              <Select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                options={[{ value: 'Internal', label: 'Internal' }, { value: 'External', label: 'External' }]}
                placeholder="All types"
              />
            </div>
            <div className="min-w-[160px]">
              <Select
                value={locationFilter}
                onChange={e => setLocationFilter(e.target.value)}
                options={locationOptions}
                placeholder="All locations"
              />
            </div>
            <label className="inline-flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={e => setShowInactive(e.target.checked)}
                className="w-4 h-4 accent-burgundy"
              />
              <span className="text-sm text-ink-mid">Show inactive</span>
            </label>
          </div>

          {loading ? (
            <div className="flex flex-col gap-2">
              <CardSkeleton lines={2} withAvatar />
              <CardSkeleton lines={2} withAvatar />
              <CardSkeleton lines={2} withAvatar />
            </div>
          ) : filteredMembers.length === 0 ? (
            <p className="text-sm text-ink-light py-6 text-center">No members match your filters</p>
          ) : (
            <ul className="flex flex-col divide-y divide-cream-dark border border-line rounded-lg">
              {filteredMembers.map(m => (
                <li key={m.id}>
                  <label className="flex items-center justify-between gap-3 p-3 cursor-pointer hover:bg-cream">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(m.id)}
                        onChange={() => toggle(m.id)}
                        className="w-4 h-4 accent-burgundy"
                      />
                      <Avatar name={m.full_name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-ink font-medium">{m.full_name}</div>
                        <div className="text-xs text-ink-light truncate">
                          {m.email ?? '—'} · {m.location ?? '—'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {m.member_type && (
                        <Badge tone={m.member_type === 'External' ? 'warning' : 'info'}>
                          {m.member_type}
                        </Badge>
                      )}
                      {m.club_preference && (
                        <Badge tone={m.club_preference === 'Yarning Circle' ? 'yarning' : 'tahi'}>
                          {m.club_preference}
                        </Badge>
                      )}
                      <Badge tone={m.exit_date ? 'neutral' : 'success'}>
                        {memberStatus(m)}
                      </Badge>
                    </div>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-sm text-ink-light">
          {selectedIds.size === 0
            ? 'No members selected'
            : `${selectedIds.size} member${selectedIds.size === 1 ? '' : 's'} selected`}
        </span>
        <Button
          onClick={handleApply}
          loading={submitting}
          disabled={selectedIds.size === 0}
        >
          Apply Update
        </Button>
      </div>
    </div>
  );
}

interface ValueInputProps {
  field: BulkField;
  value: string;
  onChange: (value: string) => void;
  clearExitDate: boolean;
  onClearExitDateChange: (value: boolean) => void;
  locationOptions: { value: string; label: string }[];
}

function ValueInput({
  field, value, onChange, clearExitDate, onClearExitDateChange, locationOptions,
}: ValueInputProps) {
  const paidUntilId = useId();
  const exitDateId = useId();
  if (field === 'paid_until') {
    return (
      <div className="flex flex-col gap-1.5 max-w-xs">
        <label htmlFor={paidUntilId} className="text-[11px] uppercase tracking-caps text-ink-mid font-semibold">
          Membership paid until
        </label>
        <input
          id={paidUntilId}
          type="date"
          className={INPUT_BASE}
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    );
  }
  if (field === 'location') {
    return (
      <div className="max-w-xs">
        <Select
          label="Location"
          value={value}
          onChange={e => onChange(e.target.value)}
          options={locationOptions}
          placeholder="Select location"
        />
      </div>
    );
  }
  if (field === 'club_preference') {
    return (
      <div className="max-w-xs">
        <Select
          label="Club preference"
          value={value}
          onChange={e => onChange(e.target.value)}
          options={[
            { value: 'Tahi', label: 'Tahi' },
            { value: 'Yarning Circle', label: 'Yarning Circle' },
            { value: 'Both', label: 'Both' },
          ]}
          placeholder="Select club"
        />
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-col gap-1.5 max-w-xs">
        <label htmlFor={exitDateId} className="text-[11px] uppercase tracking-caps text-ink-mid font-semibold">
          Exit date
        </label>
        <input
          id={exitDateId}
          type="date"
          className={INPUT_BASE}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={clearExitDate}
        />
        <span className="text-xs text-ink-light">Leave blank to clear the exit date (reactivate members)</span>
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={clearExitDate}
          onChange={e => onClearExitDateChange(e.target.checked)}
          className="w-4 h-4 accent-burgundy"
        />
        <span className="text-sm text-ink-mid">Clear exit date (reactivate selected members)</span>
      </label>
    </div>
  );
}
