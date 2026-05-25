import { ComponentType } from 'react';
import { NavLink } from 'react-router';
import clsx from 'clsx';
import {
  Button,
  CalendarIcon,
  DownloadIcon,
  HomeIcon,
  LogOutIcon,
  TrophyIcon,
  UsersIcon,
} from './ui';
import { useAuth } from '../contexts/AuthContext';

type IconComponent = ComponentType<{ size?: number; className?: string }>;

interface NavItem {
  to: string;
  label: string;
  icon: IconComponent;
  end?: boolean;
}

interface NavSection {
  label: string;
  items: NavItem[];
  disabled?: { label: string; icon: IconComponent }[];
}

const navSections: NavSection[] = [
  {
    label: 'Overview',
    items: [
      { to: '/', label: 'Dashboard', icon: HomeIcon, end: true },
    ],
  },
  {
    label: 'Members',
    items: [
      { to: '/members', label: 'Membership Records', icon: UsersIcon },
    ],
  },
  {
    label: 'Meetings',
    items: [
      { to: '/meetings', label: 'Meeting Records', icon: CalendarIcon, end: true },
    ],
  },
  {
    label: 'Coming Soon',
    items: [],
    disabled: [
      { label: 'Attendance', icon: CalendarIcon },
      { label: 'DCP Goals', icon: TrophyIcon },
    ],
  },
  {
    label: 'Data',
    items: [
      { to: '/data/export', label: 'Export App Data', icon: DownloadIcon },
    ],
  },
];

const SIDEBAR_LABEL_CLASS =
  'px-5 pb-1.5 mt-6 first:mt-0 text-[11px] font-semibold uppercase tracking-caps text-ink-light/80';

const NAV_ITEM_BASE =
  'flex items-center gap-3 px-5 py-2.5 text-[14px] text-ink-mid border-l-[3px] border-transparent transition-colors';

const NAV_ITEM_INTERACTIVE = 'cursor-pointer hover:bg-cream hover:text-ink';
const NAV_ITEM_ACTIVE = 'bg-burgundy/10 text-burgundy font-semibold border-l-burgundy';
const NAV_ITEM_DISABLED = 'opacity-40 cursor-default';

interface SidebarProps {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-5">
        {navSections.map(section => (
          <div key={section.label}>
            <div className={SIDEBAR_LABEL_CLASS}>{section.label}</div>
            {section.items.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    clsx(NAV_ITEM_BASE, NAV_ITEM_INTERACTIVE, isActive && NAV_ITEM_ACTIVE)
                  }
                >
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
            {section.disabled?.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={clsx(NAV_ITEM_BASE, NAV_ITEM_DISABLED)}>
                  <Icon size={18} className="shrink-0" />
                  <span>{item.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 p-3 mx-4 mb-4 bg-cream rounded-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-full bg-burgundy text-white font-semibold text-[13px] flex items-center justify-center shrink-0">
            {user?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="text-[13px] font-medium text-ink truncate"
              title={user?.email ?? ''}
            >
              {user?.email}
            </div>
            <div className="text-[11px] text-ink-light">Signed in</div>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => signOut()}
          icon={<LogOutIcon size={14} />}
          className="w-full justify-center"
        >
          Sign out
        </Button>
      </div>
    </div>
  );
}
