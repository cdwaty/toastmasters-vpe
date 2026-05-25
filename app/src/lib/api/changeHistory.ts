import { supabase } from '../supabase';
import { Result, ok, err, toError } from '../result';
import { log } from '../logger';
import type { ChangeHistory } from '../../types';

export interface HistoryEntry {
  label: string;
  old_value: string | null;
  new_value: string | null;
}

export async function listMemberHistory(memberId: string): Promise<Result<ChangeHistory[]>> {
  const { data, error } = await supabase
    .from('change_history')
    .select('*')
    .eq('member_id', memberId)
    .order('timestamp', { ascending: false })
    .limit(100);
  if (error) return err(toError(error));
  return ok((data ?? []) as ChangeHistory[]);
}

export async function recordMemberHistory(
  memberId: string,
  entries: HistoryEntry[],
): Promise<Result<void>> {
  if (entries.length === 0) return ok(undefined);
  const rows = entries.map(e => ({
    member_id: memberId,
    label: e.label,
    old_value: e.old_value,
    new_value: e.new_value,
  }));
  const { error } = await supabase.from('change_history').insert(rows);
  if (error) {
    log.warn(
      { memberId, entryCount: entries.length, labels: entries.map(e => e.label), error: error.message },
      'recordMemberHistory failed',
    );
    return err(toError(error));
  }
  return ok(undefined);
}
