import { useMembers } from '../contexts/MemberContext';
import { MenuIcon } from './ui';

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { members } = useMembers();
  const activeCount = members.filter(m => !m.exit_date).length;

  return (
    <header className="[grid-area:top] sticky top-0 z-[100] h-16 px-8 max-md:px-4 flex items-center justify-between bg-burgundy-dark text-white shadow-topbar">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="md:hidden w-10 h-10 inline-flex items-center justify-center rounded-md hover:bg-white/10 transition-colors"
            aria-label="Open navigation"
          >
            <MenuIcon size={22} />
          </button>
        )}
        <div className="w-9 h-9 rounded-full bg-gold text-burgundy-dark font-serif text-lg flex items-center justify-center shrink-0">
          TM
        </div>
        <div className="min-w-0">
          <div className="font-serif text-lg leading-tight truncate">Club Executive Platform</div>
          <div className="text-[11px] mt-px uppercase tracking-eyebrow text-white/80 truncate">Vice President Education</div>
        </div>
      </div>
      <span
        className="inline-flex items-center gap-1.5 bg-gold text-burgundy-dark text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap"
        title={`${activeCount} active ${activeCount === 1 ? 'member' : 'members'}`}
      >
        <span className="relative inline-flex w-2 h-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-60 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-success" />
        </span>
        <span className="tabular-nums">{activeCount}</span>
        <span className="hidden sm:inline">active {activeCount === 1 ? 'member' : 'members'}</span>
      </span>
    </header>
  );
}
