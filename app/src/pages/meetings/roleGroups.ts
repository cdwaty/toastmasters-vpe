export const ROLE_KEYS = {
  SAA: 'saa',
  CHAIR: 'chair',
  TOASTMASTER: 'toastmaster',
  HUMOUR: 'humour',
  ZOOM: 'zoom',
  ROUND_ROBIN: 'round_robin',
  SPEAKER: 'speaker',
  EVALUATOR: 'evaluator',
  BACKUP_SPEAKER: 'backup_speaker',
  TT_MASTER: 'tt_master',
  TT_SPEAKER: 'tt_speaker',
  TT_EVALUATOR: 'tt_evaluator',
  GEN_EVAL: 'gen_eval',
  GRAMMARIAN: 'grammarian',
  TIMER: 'timer',
  AH_COUNTER: 'ah_counter',
} as const;

export type RoleKey = typeof ROLE_KEYS[keyof typeof ROLE_KEYS];

export interface RoleGroup {
  label: string;
  keys: RoleKey[];
}

export const ROLE_GROUPS: RoleGroup[] = [
  { label: 'Programme', keys: [ROLE_KEYS.SAA, ROLE_KEYS.CHAIR, ROLE_KEYS.TOASTMASTER, ROLE_KEYS.HUMOUR, ROLE_KEYS.ZOOM, ROLE_KEYS.ROUND_ROBIN] },
  { label: 'Speakers', keys: [ROLE_KEYS.SPEAKER, ROLE_KEYS.EVALUATOR, ROLE_KEYS.BACKUP_SPEAKER] },
  { label: 'Table Topics', keys: [ROLE_KEYS.TT_MASTER, ROLE_KEYS.TT_SPEAKER, ROLE_KEYS.TT_EVALUATOR] },
  { label: 'Evaluation', keys: [ROLE_KEYS.GEN_EVAL, ROLE_KEYS.GRAMMARIAN, ROLE_KEYS.TIMER, ROLE_KEYS.AH_COUNTER] },
];

export const MULTI_SLOT_KEYS = new Set<string>([
  ROLE_KEYS.SPEAKER,
  ROLE_KEYS.EVALUATOR,
  ROLE_KEYS.BACKUP_SPEAKER,
  ROLE_KEYS.TT_SPEAKER,
  ROLE_KEYS.TT_EVALUATOR,
]);
