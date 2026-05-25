import type { PathwayLevel, PathwayProject, ProjectCompletion } from '../../../types';

export function isProjectComplete(project: PathwayProject, completions: ProjectCompletion[]): boolean {
  const projectCompletions = completions.filter(c => c.project_name === project.project_name);
  if (project.has_multiple_speeches && project.speech_names && project.speech_names.length > 0) {
    return project.speech_names.every((_, idx) =>
      projectCompletions.some(c => c.speech_number === idx + 1 && c.completion_date),
    );
  }
  return projectCompletions.some(c => c.speech_number === null && c.completion_date);
}

export interface LevelStats {
  done: number;
  total: number;
  percent: number;
}

export function levelStats(
  level: PathwayLevel & { pathway_projects: PathwayProject[] },
  completions: ProjectCompletion[],
): LevelStats {
  const required = level.pathway_projects.filter(p => !p.is_elective);
  const electives = level.pathway_projects.filter(p => p.is_elective);
  const requiredDone = required.filter(p => isProjectComplete(p, completions)).length;
  const electivesDone = electives.filter(p => isProjectComplete(p, completions)).length;
  const targetElectives = Math.min(electives.length, level.electives_required);
  const totalNeeded = required.length + targetElectives;
  const totalDone = requiredDone + Math.min(electivesDone, targetElectives);
  const percent = totalNeeded === 0 ? 0 : Math.min(100, (totalDone / totalNeeded) * 100);
  return { done: totalDone, total: totalNeeded, percent };
}

export function pathwayStats(
  levels: (PathwayLevel & { pathway_projects: PathwayProject[] })[],
  completions: ProjectCompletion[],
): LevelStats {
  let done = 0;
  let total = 0;
  for (const level of levels) {
    const s = levelStats(level, completions);
    done += s.done;
    total += s.total;
  }
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, percent };
}
