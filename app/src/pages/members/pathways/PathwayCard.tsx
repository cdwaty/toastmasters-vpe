import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { Badge, Button, ConfirmDialog, ProgressBar, TrophyIcon } from '../../../components/ui';
import type { LevelAward, Pathway, PathwayLevel, PathwayProject, PathwayTypeWithStructure, ProjectCompletion } from '../../../types';
import { usePathways } from '../../../contexts/PathwayContext';
import { useToast } from '../../../contexts/ToastContext';
import { formatDate } from '../../../lib/format';
import { ProjectSection } from './ProjectSection';
import { levelStats, pathwayStats } from './pathwayStats';

interface PathwayCardProps {
  pathway: Pathway;
  pathwayType: PathwayTypeWithStructure | undefined;
  completions: ProjectCompletion[];
  awards: LevelAward[];
}

const TriangleIcon = ({ open }: { open: boolean }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={clsx('text-ink-light transition-transform shrink-0', open && 'rotate-180')}
    aria-hidden="true"
  >
    <polygon points="6 9 18 9 12 16" />
  </svg>
);

const STEP_BTN_BASE = [
  'group relative flex flex-col items-center gap-1.5 px-2 pt-3.5 pb-2 rounded-xl cursor-pointer overflow-hidden min-h-[96px]',
  'text-ink-mid bg-cream border-2 border-transparent transition-all',
  'hover:bg-cream-dark hover:-translate-y-0.5 hover:shadow-soft',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
].join(' ');

const CheckIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

interface LevelRowProps {
  pathwayId: string;
  level: PathwayLevel & { pathway_projects: PathwayProject[] };
  completions: ProjectCompletion[];
  award: LevelAward | undefined;
  open: boolean;
  onToggle: () => void;
}

function LevelRow({ pathwayId, level, completions, award, open, onToggle }: LevelRowProps) {
  const { setLevelAwardDate, removeLevelAward } = usePathways();
  const { notify } = useToast();
  const stats = levelStats(level, completions);
  const remaining = Math.max(0, stats.total - stats.done);
  const levelCompletions = completions.filter(c => c.level === level.level_number);

  const handleAwardChange = async (value: string) => {
    if (!value) {
      if (award) {
        const ok = await removeLevelAward(award.id);
        if (ok) notify(`Level ${level.level_number} award cleared`);
        else notify('Could not clear award', 'error');
      }
      return;
    }
    const result = await setLevelAwardDate(pathwayId, level.level_number, value);
    if (result) notify(`Level ${level.level_number} award date saved`);
    else notify('Could not save award date', 'error');
  };

  return (
    <div className={clsx(
      'border rounded-lg overflow-hidden',
      open ? 'border-burgundy/30' : 'border-line',
    )}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={clsx(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
          open ? 'bg-burgundy/5' : 'bg-cream hover:bg-cream-dark',
        )}
      >
        <div className={clsx(
          'w-8 h-8 rounded-full font-serif text-base flex items-center justify-center shrink-0',
          award ? 'bg-success text-white' : 'bg-cream-dark text-ink-mid',
        )}>
          {level.level_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-ink text-[15px]">Level {level.level_number} — {level.level_name}</div>
          <div className="text-[12px] text-ink-light mt-1 flex items-center gap-1.5 flex-wrap">
            <span className="tabular-nums">{stats.done} of {stats.total} done</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{remaining} remaining</span>
            {award && (
              <>
                <span aria-hidden="true">·</span>
                <Badge tone="success">Awarded {formatDate(award.awarded_date)}</Badge>
              </>
            )}
          </div>
        </div>
        <TriangleIcon open={open} />
      </button>

      {open && (
        <div className="px-4 py-4 border-t border-cream-dark flex flex-col gap-3 bg-white">
          <ProgressBar value={stats.percent} />
          <ProjectSection
            pathwayId={pathwayId}
            level={level.level_number}
            projects={level.pathway_projects}
            completions={levelCompletions}
            electivesRequired={level.electives_required}
          />
          <div className="flex items-center gap-3 pt-3 border-t border-cream-dark flex-wrap">
            <div className="flex items-center gap-2 text-[13px] font-medium text-ink-mid">
              <TrophyIcon size={16} />
              <span>Level Awarded Date</span>
            </div>
            <input
              type="date"
              value={award?.awarded_date ?? ''}
              onChange={e => handleAwardChange(e.target.value)}
              className="px-2.5 py-1.5 text-[13px] border border-line rounded-md bg-white text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40"
              aria-label={`Level ${level.level_number} awarded date`}
            />
            <span className="text-xs text-ink-light tabular-nums">
              {award ? formatDate(award.awarded_date) : 'Not set'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function PathwayCard({ pathway, pathwayType, completions, awards }: PathwayCardProps) {
  const { setPrimaryPathway, deletePathway } = usePathways();
  const { notify } = useToast();

  const initialLevel = Number.isInteger(pathway.current_level) && pathway.current_level >= 1 && pathway.current_level <= 5
    ? pathway.current_level
    : 1;
  const [openLevel, setOpenLevel] = useState<number | null>(initialLevel);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const levels = pathwayType?.pathway_levels ?? [];
  const pathwayName = pathwayType?.pathway_name ?? 'Pathway';

  const overall = useMemo(() => pathwayStats(levels, completions), [levels, completions]);

  const handleSetPrimary = async () => {
    const ok = await setPrimaryPathway(pathway.id);
    if (ok) notify(`"${pathwayName}" set as primary pathway`);
    else notify(`Failed to set "${pathwayName}" as primary`, 'error');
  };

  const handleDelete = async () => {
    const ok = await deletePathway(pathway.id);
    if (ok) notify(`Pathway "${pathwayName}" removed`);
    else notify(`Failed to remove "${pathwayName}"`, 'error');
    setConfirmDelete(false);
  };

  const toggleLevel = (levelNumber: number) => {
    setOpenLevel(prev => (prev === levelNumber ? null : levelNumber));
  };

  return (
    <div className={clsx(
      'bg-white border rounded-xl overflow-hidden',
      pathway.is_primary ? 'border-burgundy/30 shadow-soft' : 'border-line',
    )}>
      <div className={clsx(
        'flex items-center justify-between gap-4 px-[18px] py-3.5 flex-wrap',
        pathway.is_primary ? 'bg-burgundy/5' : 'bg-cream',
      )}>
        <div className="flex items-center gap-2 min-w-0 flex-wrap">
          <h3 className="font-serif text-lg text-ink truncate">{pathwayName}</h3>
          {pathway.is_primary && <Badge tone="success">Primary</Badge>}
          {pathwayType?.is_legacy && <Badge tone="neutral">Legacy</Badge>}
        </div>
        <div className="flex items-center gap-3 flex-1 justify-end min-w-[200px]">
          <div className="flex flex-col items-end gap-1 min-w-[160px]">
            <span className="text-xs text-ink-mid tabular-nums">
              <span className="font-semibold text-ink">{overall.done} of {overall.total} projects</span>
              {' · '}{overall.percent}%
            </span>
            <div className="w-full max-w-[180px]">
              <ProgressBar value={overall.percent} />
            </div>
          </div>
          {!pathway.is_primary && (
            <Button variant="ghost" size="sm" onClick={handleSetPrimary}>Set primary</Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)} className="text-danger hover:text-danger">
            Remove
          </Button>
        </div>
      </div>

      <div className="px-[18px] py-4 flex flex-col gap-3">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {levels.map(level => {
            const award = awards.find(a => a.level === level.level_number);
            const stats = levelStats(level, completions);
            const isOpen = openLevel === level.level_number;
            const awarded = !!award;
            return (
              <button
                key={level.id}
                type="button"
                onClick={() => toggleLevel(level.level_number)}
                aria-pressed={isOpen}
                aria-label={`Level ${level.level_number} ${level.level_name}, ${Math.round(stats.percent)}% complete${awarded ? ', awarded' : ''}`}
                className={clsx(
                  STEP_BTN_BASE,
                  isOpen && !awarded && 'bg-white border-burgundy text-burgundy shadow-soft',
                  isOpen && awarded && 'border-success shadow-soft',
                  awarded && 'bg-success-light text-success',
                )}
              >
                {awarded && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-success text-white inline-flex items-center justify-center shadow-sm">
                    <CheckIcon size={11} />
                  </span>
                )}
                <span className="font-serif text-xl leading-none">{level.level_number}</span>
                <span className="text-[11px] leading-tight text-center px-0.5 font-medium line-clamp-2">{level.level_name}</span>
                <span className="tabular-nums text-[11px] font-semibold mt-auto">{Math.round(stats.percent)}%</span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
                  <span
                    className={clsx(
                      'block h-full transition-all',
                      awarded ? 'bg-success' : 'bg-burgundy/70',
                    )}
                    style={{ width: `${Math.min(100, Math.max(0, stats.percent))}%` }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-cream-dark">
          {levels.map(level => (
            <LevelRow
              key={level.id}
              pathwayId={pathway.id}
              level={level}
              completions={completions}
              award={awards.find(a => a.level === level.level_number)}
              open={openLevel === level.level_number}
              onToggle={() => toggleLevel(level.level_number)}
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove pathway?"
        message="This will permanently delete the pathway and all completed projects. This cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
