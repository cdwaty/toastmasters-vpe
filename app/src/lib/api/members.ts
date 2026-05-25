import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import type { Member } from '../../types';

export async function listMembers(): Promise<Result<Member[]>> {
  const { data, error } = await supabase.from('members').select('*').order('full_name');
  if (error) return err(toError(error));
  return ok((data ?? []) as Member[]);
}

export async function createMember(input: Partial<Member>): Promise<Result<Member>> {
  const { data, error } = await supabase.from('members').insert(input).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Member);
}

export async function updateMember(id: string, patch: Partial<Member>): Promise<Result<Member>> {
  const { data, error } = await supabase.from('members').update(patch).eq('id', id).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Member);
}

export async function deleteMember(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('members').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}

export async function bulkUpdateMembers(ids: string[], patch: Partial<Member>): Promise<Result<void>> {
  const { error } = await supabase.from('members').update(patch).in('id', ids);
  if (error) return err(toError(error));
  return ok(undefined);
}
