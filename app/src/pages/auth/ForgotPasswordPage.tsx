import { FormEvent, useState } from 'react';
import { Link } from 'react-router';
import { Button, InboxIcon, TextInput } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';
import { routes } from '../../lib/routes';
import { AuthShell } from './AuthShell';

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    await resetPassword(email.trim().toLowerCase());
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthShell
        icon={<InboxIcon size={26} />}
        title="Check your inbox"
        subtitle="If an account exists for that email, we have sent a password reset link. The link expires in 15 minutes."
        footer={
          <div className="flex flex-col items-center gap-2">
            <Link to={routes.login} className="text-burgundy hover:underline font-medium">Back to sign in</Link>
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-xs text-ink-light hover:text-ink-mid"
            >
              Try a different email
            </button>
          </div>
        }
      />
    );
  }

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your account email and we will send a reset link."
      footer={<Link to={routes.login} className="text-burgundy hover:underline">Back to sign in</Link>}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <TextInput
          type="email"
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
          error={error ?? undefined}
        />
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
