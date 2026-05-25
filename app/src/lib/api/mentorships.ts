import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import type { Mentorship } from '../../types';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function listMentorshipsForMember(memberId: string): Promise<Result<Mentorship[]>> {
  if (!UUID_RE.test(memberId)) return err(new Error('Invalid memberId'));
  const { data, error } = await supabase
    .from('mentorships')
    .select('*')
    .or(`mentor_id.eq.${memberId},mentee_id.eq.${memberId}`)
    .order('start_date', { ascending: false });
  if (error) return err(toError(error));
  return ok((data ?? []) as Mentorship[]);
}

export async function createMentorship(input: Partial<Mentorship>): Promise<Result<Mentorship>> {
  const { data, error } = await supabase.from('mentorships').insert(input).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Mentorship);
}

export async function updateMentorship(id: string, patch: Partial<Mentorship>): Promise<Result<Mentorship>> {
  const { data, error } = await supabase.from('mentorships').update(patch).eq('id', id).select('*').single();
  if (error) return err(toError(error));
  return ok(data as Mentorship);
}

export async function deleteMentorship(id: string): Promise<Result<void>> {
  const { error } = await supabase.from('mentorships').delete().eq('id', id);
  if (error) return err(toError(error));
  return ok(undefined);
}
