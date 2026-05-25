import { useEffect, useId, useState } from 'react';
import clsx from 'clsx';
import { Badge } from '../../../components/ui';
import { usePathways } from '../../../contexts/PathwayContext';
import { useMembers } from '../../../contexts/MemberContext';
import { useToast } from '../../../contexts/ToastContext';
import { formatDate } from '../../../lib/format';
import type { PathwayProject, ProjectCompletion } from '../../../types';
import { isProjectComplete } from './pathwayStats';

const CUSTOM_EVALUATOR = '__custom__';

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ProjectSectionProps {
  pathwayId: string;
  level: number;
  projects: PathwayProject[];
  completions: ProjectCompletion[];
  electivesRequired: number;
}

export function ProjectSection({ pathwayId, level, projects, completions, electivesRequired }: ProjectSectionProps) {
  const completionsByProject = (name: string) => completions.filter(c => c.project_name === name);

  const required = projects.filter(p => !p.is_elective);
  const electives = projects.filter(p => p.is_elective);
  const electivesDone = electives.filter(p => isProjectComplete(p, completions)).length;

  return (
    <div className="flex flex-col gap-4">
      {required.length > 0 && (
        <ProjectGroup
          title="Mandatory"
          pathwayId={pathwayId}
          level={level}
          projects={required}
          completionsByProject={completionsByProject}
        />
      )}
      {electives.length > 0 && (
        <ProjectGroup
          title="Electives"
          titleSuffix={`(Choose ${electivesRequired})`}
          subtitle={`${electivesDone} of ${electivesRequired} chosen`}
          pathwayId={pathwayId}
          level={level}
          projects={electives}
          completionsByProject={completionsByProject}
        />
      )}
    </div>
  );
}

interface ProjectGroupProps {
  title: string;
  titleSuffix?: string;
  subtitle?: string;
  pathwayId: string;
  level: number;
  projects: PathwayProject[];
  completionsByProject: (name: string) => ProjectCompletion[];
}

function ProjectGroup({ title, titleSuffix, subtitle, pathwayId, level, projects, completionsByProject }: ProjectGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-ink-light">
          {title}
          {titleSuffix && <span className="text-burgundy ml-1">{titleSuffix}</span>}
        </h4>
        {subtitle && <span className="text-[12px] text-ink-light italic">{subtitle}</span>}
      </div>
      <ul className="flex flex-col gap-1.5">
        {projects.map(project => (
          <ProjectRow
            key={project.id}
            pathwayId={pathwayId}
            level={level}
            project={project}
            projectCompletions={completionsByProject(project.project_name)}
          />
        ))}
      </ul>
    </div>
  );
}

interface ProjectRowProps {
  pathwayId: string;
  level: number;
  project: PathwayProject;
  projectCompletions: ProjectCompletion[];
}

function ProjectRow({ pathwayId, level, project, projectCompletions }: ProjectRowProps) {
  const [open, setOpen] = useState(false);
  const isMulti = project.has_multiple_speeches && !!project.speech_names && project.speech_names.length > 0;
  const done = isProjectComplete(project, projectCompletions);

  return (
    <li className={clsx(
      'rounded-lg border bg-white overflow-hidden',
      done ? 'border-success/30 bg-success-light/30' : 'border-line',
      open && 'shadow-soft',
    )}>
      {isMulti ? (
        <MultiSpeechHeader
          project={project}
          projectCompletions={projectCompletions}
          open={open}
          onToggle={() => setOpen(v => !v)}
        />
      ) : (
        <SingleProjectHeader
          pathwayId={pathwayId}
          level={level}
          project={project}
          completion={projectCompletions.find(c => c.speech_number === null)}
          open={open}
          onToggle={() => setOpen(v => !v)}
        />
      )}

      {open && !isMulti && (
        <CompletionForm
          pathwayId={pathwayId}
          level={level}
          projectName={project.project_name}
          speechNumber={null}
          completion={projectCompletions.find(c => c.speech_number === null)}
        />
      )}

      {open && isMulti && (
        <div className="border-t border-cream-dark px-3 py-3 flex flex-col gap-1.5">
          {project.speech_names!.map((speechName, idx) => (
            <SpeechRow
              key={speechName}
              pathwayId={pathwayId}
              level={level}
              projectName={project.project_name}
              speechName={speechName}
              speechNumber={idx + 1}
              completion={projectCompletions.find(c => c.speech_number === idx + 1)}
            />
          ))}
        </div>
      )}
    </li>
  );
}

interface SingleProjectHeaderProps {
  pathwayId: string;
  level: number;
  project: PathwayProject;
  completion: ProjectCompletion | undefined;
  open: boolean;
  onToggle: () => void;
}

function SingleProjectHeader({ pathwayId, level, project, completion, open, onToggle }: SingleProjectHeaderProps) {
  const done = !!completion?.completion_date;
  const { upsertCompletion } = usePathways();

  const handleCheckboxClick = async () => {
    if (completion) {
      await upsertCompletion({
        id: completion.id,
        completion_date: done ? null : (completion.completion_date ?? todayIso()),
      });
    } else {
      await upsertCompletion({
        pathway_id: pathwayId,
        level,
        project_name: project.project_name,
        speech_number: null,
        completion_date: todayIso(),
      });
    }
  };

  return (
    <div className="flex items-center gap-3 pl-3 pr-3 hover:bg-cream/60 transition-colors">
      <button
        type="button"
        onClick={handleCheckboxClick}
        aria-label={done ? 'Mark incomplete' : 'Mark complete'}
        aria-pressed={done}
        className="py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 rounded"
      >
        <Checkbox checked={done} />
      </button>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-3 flex-1 min-w-0 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 rounded"
      >
        <span className="text-sm text-ink flex-1 min-w-0 truncate">{project.project_name}</span>
        {done && completion && !open && <CompletionSummary completion={completion} />}
      </button>
      {project.is_elective && <Badge tone="warning">Elective</Badge>}
    </div>
  );
}

interface MultiSpeechHeaderProps {
  project: PathwayProject;
  projectCompletions: ProjectCompletion[];
  open: boolean;
  onToggle: () => void;
}

function MultiSpeechHeader({ project, projectCompletions, open, onToggle }: MultiSpeechHeaderProps) {
  const total = project.speech_names!.length;
  const doneCount = project.speech_names!.filter((_, idx) =>
    projectCompletions.some(c => c.speech_number === idx + 1 && c.completion_date),
  ).length;
  const allDone = doneCount === total;

  return (
    <div className="flex items-center gap-3 px-3 hover:bg-cream/60 transition-colors">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex items-center gap-3 flex-1 min-w-0 py-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 rounded"
      >
        <span className={clsx(
          'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums shrink-0',
          allDone ? 'bg-success text-white' : doneCount > 0 ? 'bg-burgundy/15 text-burgundy' : 'bg-cream-dark text-ink-light',
        )}>
          {doneCount}/{total} speeches
        </span>
        <span className="text-sm text-ink flex-1 min-w-0 truncate">{project.project_name}</span>
      </button>
      {project.is_elective && <Badge tone="warning">Elective</Badge>}
    </div>
  );
}

interface SpeechRowProps {
  pathwayId: string;
  level: number;
  projectName: string;
  speechName: string;
  speechNumber: number;
  completion: ProjectCompletion | undefined;
}

function SpeechRow({ pathwayId, level, projectName, speechName, speechNumber, completion }: SpeechRowProps) {
  const [open, setOpen] = useState(false);
  const { upsertCompletion, deleteCompletion } = usePathways();
  const done = !!completion?.completion_date;

  const handleCheckboxClick = async () => {
    if (completion && done) {
      await deleteCompletion(completion.id);
    } else if (completion) {
      await upsertCompletion({ id: completion.id, completion_date: todayIso() });
    } else {
      await upsertCompletion({
        pathway_id: pathwayId,
        level,
        project_name: projectName,
        speech_number: speechNumber,
        speech_title: speechName,
        completion_date: todayIso(),
      });
    }
  };

  return (
    <div className={clsx(
      'rounded-md border bg-white overflow-hidden',
      done ? 'border-success/30 bg-success-light/30' : 'border-line',
    )}>
      <div className="flex items-center gap-3 px-3 hover:bg-cream/60 transition-colors">
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={done ? 'Mark incomplete' : 'Mark complete'}
          aria-pressed={done}
          className="py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 rounded"
        >
          <Checkbox checked={done} />
        </button>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="flex items-center gap-3 flex-1 min-w-0 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40 rounded"
        >
          <span className="text-sm text-ink-mid flex-1 min-w-0 truncate">{speechName}</span>
          {done && completion && !open && <CompletionSummary completion={completion} />}
        </button>
      </div>
      {open && (
        <CompletionForm
          pathwayId={pathwayId}
          level={level}
          projectName={projectName}
          speechNumber={speechNumber}
          completion={completion}
        />
      )}
    </div>
  );
}

function CompletionSummary({ completion }: { completion: ProjectCompletion }) {
  const parts: string[] = [];
  if (completion.completion_date) parts.push(formatDate(completion.completion_date));
  if (completion.evaluator_name) parts.push(completion.evaluator_name);
  if (completion.speech_title) parts.push(completion.speech_title);
  if (parts.length === 0) return null;
  return (
    <span className="text-xs text-ink-light truncate shrink-0 max-w-[40%]">
      {parts.join(' · ')}
    </span>
  );
}

interface CompletionFormProps {
  pathwayId: string;
  level: number;
  projectName: string;
  speechNumber: number | null;
  completion: ProjectCompletion | undefined;
}

function CompletionForm({ pathwayId, level, projectName, speechNumber, completion }: CompletionFormProps) {
  const { upsertCompletion, deleteCompletion } = usePathways();
  const { members } = useMembers();
  const { notify } = useToast();

  const dateId = useId();
  const titleId = useId();
  const evalId = useId();

  const [date, setDate] = useState(completion?.completion_date ?? '');
  const [title, setTitle] = useState(completion?.speech_title ?? '');
  const initialSelect = completion?.evaluator_member_id
    ? completion.evaluator_member_id
    : completion?.evaluator_name ? CUSTOM_EVALUATOR : '';
  const [selectValue, setSelectValue] = useState(initialSelect);
  const [customName, setCustomName] = useState(
    completion?.evaluator_member_id ? '' : (completion?.evaluator_name ?? ''),
  );

  useEffect(() => {
    setDate(completion?.completion_date ?? '');
    setTitle(completion?.speech_title ?? '');
    const next = completion?.evaluator_member_id
      ? completion.evaluator_member_id
      : completion?.evaluator_name ? CUSTOM_EVALUATOR : '';
    setSelectValue(next);
    setCustomName(completion?.evaluator_member_id ? '' : (completion?.evaluator_name ?? ''));
  }, [completion?.id, completion?.completion_date, completion?.speech_title, completion?.evaluator_member_id, completion?.evaluator_name]);

  const activeMembers = members.filter(m => !m.exit_date);

  const persist = async (patch: Partial<ProjectCompletion>) => {
    if (completion) {
      const result = await upsertCompletion({ id: completion.id, ...patch });
      if (!result) notify('Could not save', 'error');
      return result;
    }
    const allEmpty = Object.entries(patch).every(([, v]) => v === null || v === '' || v === undefined);
    if (allEmpty) return null;
    const result = await upsertCompletion({
      pathway_id: pathwayId,
      level,
      project_name: projectName,
      speech_number: speechNumber,
      ...patch,
    });
    if (!result) notify('Could not save', 'error');
    return result;
  };

  const handleDateChange = async (value: string) => {
    setDate(value);
    if (!value && completion && !completion.speech_title && !completion.evaluator_name) {
      await deleteCompletion(completion.id);
      return;
    }
    await persist({ completion_date: value || null });
  };

  const handleTitleBlur = async () => {
    if ((completion?.speech_title ?? '') === title) return;
    await persist({ speech_title: title || null });
  };

  const handleSelectChange = async (value: string) => {
    setSelectValue(value);
    if (value === CUSTOM_EVALUATOR) {
      await persist({ evaluator_member_id: null, evaluator_name: customName || null });
      return;
    }
    if (value === '') {
      await persist({ evaluator_member_id: null, evaluator_name: null });
      return;
    }
    const member = members.find(m => m.id === value);
    await persist({ evaluator_member_id: value, evaluator_name: member?.full_name ?? null });
  };

  const handleCustomBlur = async () => {
    if (selectValue !== CUSTOM_EVALUATOR) return;
    if ((completion?.evaluator_name ?? '') === customName) return;
    await persist({ evaluator_member_id: null, evaluator_name: customName || null });
  };

  return (
    <div className="bg-cream/60 border-t border-cream-dark px-3 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
      <FieldBlock label="Date Completed" htmlFor={dateId}>
        <input
          id={dateId}
          type="date"
          value={date}
          onChange={e => handleDateChange(e.target.value)}
          className={fieldInputClass}
        />
      </FieldBlock>
      <FieldBlock label="Speech Title" hint="optional" htmlFor={titleId}>
        <input
          id={titleId}
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleTitleBlur}
          placeholder="e.g. My Toastmasters Journey"
          className={fieldInputClass}
        />
      </FieldBlock>
      <FieldBlock label="Evaluator" hint="optional" htmlFor={evalId}>
        <select
          id={evalId}
          value={selectValue}
          onChange={e => handleSelectChange(e.target.value)}
          className={fieldInputClass}
        >
          <option value="">— Select or type below —</option>
          <optgroup label="Club Members">
            {activeMembers.map(m => (
              <option key={m.id} value={m.id}>{m.full_name}</option>
            ))}
          </optgroup>
          <option value={CUSTOM_EVALUATOR}>Someone outside the club…</option>
        </select>
        {selectValue === CUSTOM_EVALUATOR && (
          <input
            type="text"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
            onBlur={handleCustomBlur}
            placeholder="Evaluator name"
            aria-label="External evaluator name"
            className={clsx(fieldInputClass, 'mt-1.5')}
          />
        )}
      </FieldBlock>
    </div>
  );
}

const fieldInputClass = 'w-full px-2.5 py-1.5 text-sm border border-line rounded-md bg-white text-ink placeholder:text-ink-light/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40';

function FieldBlock({ label, hint, htmlFor, children }: { label: string; hint?: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label htmlFor={htmlFor} className="text-[11px] uppercase tracking-wider font-semibold text-ink-light">
        {label}
        {hint && <span className="text-ink-light/70 normal-case font-normal tracking-normal"> ({hint})</span>}
      </label>
      {children}
    </div>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={clsx(
        'w-5 h-5 rounded border-2 inline-flex items-center justify-center shrink-0 transition-colors',
        checked ? 'bg-burgundy border-burgundy' : 'bg-white border-ink-light/50',
      )}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </span>
  );
}
