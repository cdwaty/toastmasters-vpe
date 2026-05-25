import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import { bestMatch } from '../../utils/fuzzyMatch';
import { recordMemberHistory } from '../api/changeHistory';
import type {
  Member, PathwayTypeWithStructure, Pathway, ProjectCompletion,
} from '../../types';
import type { PathwayHtmlEntry } from './pathwayHtml';

export interface PathwayImportMatch {
  rawMemberName: string;
  rawPathwayName: string;
  member: Member | null;
  memberScore: number;
  pathwayType: PathwayTypeWithStructure | null;
  pathwayScore: number;
  entries: PathwayHtmlEntry[];
}

const MEMBER_THRESHOLD = 0.6;
const PATHWAY_THRESHOLD = 0.5;

export function matchPathwayEntries(
  entries: PathwayHtmlEntry[],
  members: Member[],
  pathwayTypes: PathwayTypeWithStructure[],
): PathwayImportMatch[] {
  const byKey = new Map<string, PathwayHtmlEntry[]>();
  for (const entry of entries) {
    const key = `${entry.rawMemberName}::${entry.rawPathwayName}`;
    const list = byKey.get(key) ?? [];
    list.push(entry);
    byKey.set(key, list);
  }

  const matches: PathwayImportMatch[] = [];
  for (const [, groupEntries] of byKey) {
    const sample = groupEntries[0];
    const memberMatch = bestMatch(sample.rawMemberName, members, m => m.full_name);
    const aliasMember = members.find(m =>
      (m.aliases ?? []).some(a => a.toLowerCase() === sample.rawMemberName.toLowerCase()),
    );
    const member = aliasMember
      ? aliasMember
      : memberMatch && memberMatch.score >= MEMBER_THRESHOLD ? memberMatch.candidate : null;

    const pathwayMatch = bestMatch(sample.rawPathwayName, pathwayTypes, p => p.pathway_name);

    matches.push({
      rawMemberName: sample.rawMemberName,
      rawPathwayName: sample.rawPathwayName,
      member,
      memberScore: aliasMember ? 1 : memberMatch?.score ?? 0,
      pathwayType: pathwayMatch && pathwayMatch.score >= PATHWAY_THRESHOLD ? pathwayMatch.candidate : null,
      pathwayScore: pathwayMatch?.score ?? 0,
      entries: groupEntries,
    });
  }
  return matches;
}

export interface PathwayImportResult {
  pathwaysCreated: number;
  completionsCreated: number;
  skipped: number;
}

export async function importMatchedPathways(
  matches: PathwayImportMatch[],
): Promise<Result<PathwayImportResult>> {
  let pathwaysCreated = 0;
  let completionsCreated = 0;
  let skipped = 0;

  for (const match of matches) {
    if (!match.member || !match.pathwayType) {
      skipped++;
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from('pathways')
      .select('*')
      .eq('member_id', match.member.id)
      .eq('pathway_type_id', match.pathwayType.id)
      .maybeSingle();
    if (existingError) return err(toError(existingError));

    let pathway = existing as Pathway | null;
    if (!pathway) {
      const { data: inserted, error: insertError } = await supabase
        .from('pathways')
        .insert({
          member_id: match.member.id,
          pathway_type_id: match.pathwayType.id,
          is_primary: false,
          current_level: 1,
        })
        .select('*')
        .single();
      if (insertError) return err(toError(insertError));
      pathway = inserted as Pathway;
      pathwaysCreated++;
    }

    const completions: Partial<ProjectCompletion>[] = match.entries
      .filter(e => typeof e.level === 'number' && Number.isInteger(e.level) && e.level >= 1 && e.level <= 5)
      .map(e => ({
        pathway_id: pathway!.id,
        level: e.level!,
        project_name: e.rawProjectName,
        completion_date: e.date || null,
        speech_title: e.title || null,
      }));

    if (completions.length > 0) {
      const { error: completionError, count } = await supabase
        .from('project_completions')
        .insert(completions, { count: 'exact' });
      if (completionError) return err(toError(completionError));
      completionsCreated += count ?? completions.length;
    }

    await recordMemberHistory(match.member.id, [
      {
        label: `Pathway data imported via HTML file: ${match.pathwayType.pathway_name}`,
        old_value: null,
        new_value: null,
      },
    ]);
  }

  return ok({ pathwaysCreated, completionsCreated, skipped });
}
