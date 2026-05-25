import { describe, it, expect } from 'vitest';
import type { PathwayLevel, PathwayProject, ProjectCompletion } from '../../../types';
import { isProjectComplete, levelStats, pathwayStats } from './pathwayStats';

const project = (over: Partial<PathwayProject>): PathwayProject => ({
  id: 'pp',
  pathway_level_id: 'lvl',
  project_name: 'Ice Breaker',
  is_elective: false,
  has_multiple_speeches: false,
  speech_names: null,
  sort_order: 0,
  ...over,
});

const completion = (over: Partial<ProjectCompletion>): ProjectCompletion => ({
  id: 'c',
  pathway_id: 'p',
  level: 1,
  project_name: 'Ice Breaker',
  completion_date: '2024-01-01',
  speech_title: null,
  evaluator_name: null,
  evaluator_member_id: null,
  speech_number: null,
  ...over,
});

const level = (projects: PathwayProject[], electives_required = 0): PathwayLevel & { pathway_projects: PathwayProject[] } => ({
  id: 'lvl',
  pathway_type_id: 'pt',
  level_number: 1,
  level_name: 'Level 1',
  electives_required,
  pathway_projects: projects,
});

describe('isProjectComplete', () => {
  it('is true when a single-speech project has a completion with date and null speech_number', () => {
    expect(isProjectComplete(project({}), [completion({})])).toBe(true);
  });

  it('is false when completion has no date', () => {
    expect(isProjectComplete(project({}), [completion({ completion_date: null })])).toBe(false);
  });

  it('is false when no matching completion exists', () => {
    expect(isProjectComplete(project({}), [])).toBe(false);
  });

  it('multi-speech: requires every speech_name to have a dated completion', () => {
    const p = project({ has_multiple_speeches: true, speech_names: ['Speech 1', 'Speech 2'] });
    expect(isProjectComplete(p, [completion({ speech_number: 1 })])).toBe(false);
    expect(
      isProjectComplete(p, [completion({ speech_number: 1 }), completion({ speech_number: 2 })]),
    ).toBe(true);
  });
});

describe('levelStats', () => {
  it('returns 0/0 with 0% when level has no projects', () => {
    expect(levelStats(level([]), [])).toEqual({ done: 0, total: 0, percent: 0 });
  });

  it('counts required projects only when no electives needed', () => {
    const lvl = level([
      project({ project_name: 'A' }),
      project({ project_name: 'B' }),
    ]);
    const stats = levelStats(lvl, [completion({ project_name: 'A' })]);
    expect(stats).toEqual({ done: 1, total: 2, percent: 50 });
  });

  it('counts up to electives_required electives', () => {
    const lvl = level(
      [
        project({ project_name: 'R' }),
        project({ project_name: 'E1', is_elective: true }),
        project({ project_name: 'E2', is_elective: true }),
      ],
      1,
    );
    const stats = levelStats(lvl, [
      completion({ project_name: 'R' }),
      completion({ project_name: 'E1' }),
      completion({ project_name: 'E2' }),
    ]);
    expect(stats).toEqual({ done: 2, total: 2, percent: 100 });
  });

  it('caps percent at 100', () => {
    const lvl = level([project({ project_name: 'A' })]);
    const stats = levelStats(lvl, [completion({ project_name: 'A' })]);
    expect(stats.percent).toBe(100);
  });
});

describe('pathwayStats', () => {
  it('aggregates done/total across all levels and rounds percent', () => {
    const lvl1 = level([project({ project_name: 'A' }), project({ project_name: 'B' })]);
    const lvl2 = level([project({ project_name: 'C' })]);
    const stats = pathwayStats([lvl1, lvl2], [completion({ project_name: 'A' })]);
    expect(stats.done).toBe(1);
    expect(stats.total).toBe(3);
    expect(stats.percent).toBe(33);
  });

  it('returns 0% when no projects required', () => {
    expect(pathwayStats([], [])).toEqual({ done: 0, total: 0, percent: 0 });
  });
});
