import { SearchIcon, Select, TextInput } from '../../../components/ui';

export interface RosterFilterState {
  search: string;
  typeFilter: string;
  locationFilter: string;
  clubFilter: string;
  showInactive: boolean;
}

interface RosterFiltersProps {
  state: RosterFilterState;
  locationOptions: { value: string; label: string }[];
  onChange: (patch: Partial<RosterFilterState>) => void;
}

const TYPE_OPTIONS = [
  { value: 'Internal', label: 'Internal' },
  { value: 'External', label: 'External' },
];

const CLUB_OPTIONS = [
  { value: 'Tahi', label: 'Tahi' },
  { value: 'Yarning Circle', label: 'Yarning Circle' },
  { value: 'Both', label: 'Both' },
];

export function RosterFilters({ state, locationOptions, onChange }: RosterFiltersProps) {
  return (
    <div className="p-5 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[240px]">
        <TextInput
          placeholder="Search name or email…"
          value={state.search}
          onChange={e => onChange({ search: e.target.value })}
          leadingIcon={<SearchIcon size={16} />}
        />
      </div>
      <div className="min-w-[170px]">
        <Select
          value={state.typeFilter}
          onChange={e => onChange({ typeFilter: e.target.value })}
          options={TYPE_OPTIONS}
          placeholder="All member types"
        />
      </div>
      <div className="min-w-[160px]">
        <Select
          value={state.locationFilter}
          onChange={e => onChange({ locationFilter: e.target.value })}
          options={locationOptions}
          placeholder="All locations"
        />
      </div>
      <div className="min-w-[140px]">
        <Select
          value={state.clubFilter}
          onChange={e => onChange({ clubFilter: e.target.value })}
          options={CLUB_OPTIONS}
          placeholder="All clubs"
        />
      </div>
      <label className="inline-flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={state.showInactive}
          onChange={e => onChange({ showInactive: e.target.checked })}
        />
        <span className="w-9 h-5 rounded-full bg-ink-light/40 peer-checked:bg-burgundy peer-focus-visible:ring-2 peer-focus-visible:ring-burgundy/40 relative transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
        <span className="text-sm text-ink-mid">Show inactive</span>
      </label>
    </div>
  );
}
