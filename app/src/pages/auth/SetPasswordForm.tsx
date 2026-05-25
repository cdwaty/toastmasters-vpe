import { FormEvent, useState } from 'react';
import { Button, TextInput } from '../../components/ui';
import { validatePassword } from '../../utils/validation';

interface SetPasswordFormProps {
  submitLabel: string;
  onSubmit: (password: string) => Promise<string | null>;
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '8+ characters', pass: password.length >= 8 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Lowercase', pass: /[a-z]/.test(password) },
    { label: 'Number', pass: /\d/.test(password) },
  ];
  return (
    <ul className="text-xs flex flex-wrap gap-x-3 gap-y-1 -mt-1.5 px-1">
      {checks.map(c => (
        <li
          key={c.label}
          className={c.pass ? 'text-success font-medium' : 'text-ink-light'}
        >
          {c.pass ? '✓' : '○'} {c.label}
        </li>
      ))}
    </ul>
  );
}

export function SetPasswordForm({ submitLabel, onSubmit }: SetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const submitError = await onSubmit(password);
    setSubmitting(false);
    if (submitError) setError(submitError);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
      <TextInput
        type={show ? 'text' : 'password'}
        label="New password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="new-password"
        required
      />
      <PasswordStrength password={password} />
      <TextInput
        type={show ? 'text' : 'password'}
        label="Confirm password"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        autoComplete="new-password"
        required
        error={error ?? undefined}
      />
      <label className="inline-flex items-center gap-2 text-sm text-ink-mid cursor-pointer select-none -mt-1">
        <input
          type="checkbox"
          checked={show}
          onChange={e => setShow(e.target.checked)}
          className="w-4 h-4 accent-burgundy"
        />
        Show password
      </label>
      <Button type="submit" size="lg" loading={submitting} className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}
