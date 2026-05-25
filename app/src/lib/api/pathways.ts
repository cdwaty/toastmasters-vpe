import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import type { LevelAward, Pathway, ProjectCompletion } from '../../types';

export async function listAllPathways(): Promise<Result<Pathway[]>> {
  const { data, error } = await supabase
    .from('pathways')
    .select('*')
    .order('is_primary', { ascending: false });
  if (error) return err(toError(error));
  return ok((data ?? []) as Pathway[]);
}

export async function listPathwaysForMember(memberId: string): Promise<Result<Pathway[]>> {
  const { data, error } = await supabase
    .from('pathways')
    .select('*')
    .eq('member_id', memberId)
    .order('is_primary', { ascending: false });
  if (error) return err(toError(error));
  return ok((data ?? []) as Pathway[]);
}

export async function createPathway(input: Partial<Pathway>): Promise<Result<Pathway>> {
  const { data, error } = await supabase.from('pathways').insert(input).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Pathway);
}

export async function updatePathway(id: string, patch: Partial<Pathway>): Promise<Result<Pathway>> {
  const { data, error } = await supabase.from('pathways').update(patch).eq('id', id).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Pathway);
}

export async function deletePathway(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('pathways').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}

export async function listProjectCompletions(pathwayId: string): Promise<Result<ProjectCompletion[]>> {
  const { data, error } = await supabase
    .from('project_completions')
    .select('*')
    .eq('pathway_id', pathwayId)
    .order('level')
    .order('speech_number');
  if (error) return err(toError(error));
  return ok((data ?? []) as ProjectCompletion[]);
}

export async function listProjectCompletionsForPathways(pathwayIds: string[]): Promise<Result<ProjectCompletion[]>> {
  if (pathwayIds.length === 0) return ok([]);
  const { data, error } = await supabase
    .from('project_completions')
    .select('*')
    .in('pathway_id', pathwayIds)
    .order('level')
    .order('speech_number');
  if (error) return err(toError(error));
  return ok((data ?? []) as ProjectCompletion[]);
}

export async function upsertProjectCompletion(input: Partial<ProjectCompletion>): Promise<Result<ProjectCompletion>> {
  if (input.id) {
    const { id, ...patch } = input;
    const { data, error } = await supabase
      .from('project_completions')
      .update(patch)
      .eq('id', id)
      .select('*')
      .single();
    if (error) return err(toError(error));
    return ok(data as ProjectCompletion);
  }
  const { data, error } = await supabase
    .from('project_completions')
    .insert(input)
    .select('*')
    .single();
  if (error) return err(toError(error));
  return ok(data as ProjectCompletion);
}

export async function deleteProjectCompletion(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('project_completions').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}

export async function listLevelAwards(pathwayId: string): Promise<Result<LevelAward[]>> {
  const { data, error } = await supabase
    .from('level_awards')
    .select('*')
    .eq('pathway_id', pathwayId)
    .order('level');
  if (error) return err(toError(error));
  return ok((data ?? []) as LevelAward[]);
}

export async function listLevelAwardsForPathways(pathwayIds: string[]): Promise<Result<LevelAward[]>> {
  if (pathwayIds.length === 0) return ok([]);
  const { data, error } = await supabase
    .from('level_awards')
    .select('*')
    .in('pathway_id', pathwayIds)
    .order('level');
  if (error) return err(toError(error));
  return ok((data ?? []) as LevelAward[]);
}

export async function setLevelAwardDate(
  pathwayId: string,
  level: number,
  awardedDate: string,
): Promise<Result<LevelAward>> {
  const { data: existing, error: findError } = await supabase
    .from('level_awards')
    .select('*')
    .eq('pathway_id', pathwayId)
    .eq('level', level)
    .maybeSingle();
  if (findError) return err(toError(findError));

  if (existing) {
    const { data, error } = await supabase
      .from('level_awards')
      .update({ awarded_date: awardedDate })
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) return err(toError(error));
    return ok(data as LevelAward);
  }

  const { data, error } = await supabase
    .from('level_awards')
    .insert({ pathway_id: pathwayId, level, awarded_date: awardedDate })
    .select('*')
    .single();
  if (error) return err(toError(error));
  return ok(data as LevelAward);
}

export async function deleteLevelAward(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('level_awards').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}
