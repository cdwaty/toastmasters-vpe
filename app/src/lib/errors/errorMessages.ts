interface MessageRule {
  match: (text: string) => boolean;
  message: string;
}

const AUTH_RULES: MessageRule[] = [
  { match: t => t.includes('invalid login credentials'), message: 'Incorrect email or password.' },
  { match: t => t.includes('email not confirmed'), message: 'Please verify your email before signing in. Check your inbox for the setup link.' },
  { match: t => t.includes('signups not allowed'), message: 'Public signups are disabled. Contact your administrator.' },
  { match: t => t.includes('rate limit') || t.includes('too many'), message: 'Too many attempts. Try again in a few minutes.' },
  { match: t => t.includes('token has expired') || t.includes('expired'), message: 'This link has expired. Request a new one.' },
  { match: t => t.includes('user not found'), message: 'No account found for that email.' },
];

const DATABASE_RULES: MessageRule[] = [
  { match: t => t.includes('duplicate key') || t.includes('unique constraint'), message: 'A record with that identifier already exists.' },
  { match: t => t.includes('foreign key'), message: 'Cannot complete the action because another record depends on this one.' },
  { match: t => t.includes('row-level security') || t.includes('permission denied'), message: 'You do not have permission to perform this action.' },
  { match: t => t.includes('not null') || t.includes('null value'), message: 'A required field is missing.' },
];

const NETWORK_RULES: MessageRule[] = [
  { match: t => t.includes('failed to fetch') || t.includes('networkerror'), message: 'Network error. Check your connection and try again.' },
  { match: t => t.includes('timeout'), message: 'The request timed out. Try again.' },
];

function applyRules(rules: MessageRule[], rawMessage: string): string | null {
  const lower = rawMessage.toLowerCase();
  const hit = rules.find(rule => rule.match(lower));
  return hit ? hit.message : null;
}

export function authMessage(raw: string): string {
  return applyRules(AUTH_RULES, raw) ?? raw;
}

export function databaseMessage(raw: string): string {
  return applyRules(DATABASE_RULES, raw) ?? 'Database error. Please try again.';
}

export function networkMessage(raw: string): string {
  return applyRules(NETWORK_RULES, raw) ?? 'Connection error. Please try again.';
}
