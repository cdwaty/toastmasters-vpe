import { FormEvent, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router';
import { Button, TextInput } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { authErrorMessage } from '../../lib/authErrors';
import { routes } from '../../lib/routes';
import { AuthShell } from './AuthShell';

interface LocationState {
  from?: { pathname?: string };
  notice?: string;
}

export function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LocationState;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <AuthShell title="Loading…">
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        </div>
      </AuthShell>
    );
  }
  if (user) return <Navigate to={routes.home} replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { error: authError } = await signIn(email, password);
    setSubmitting(false);
    if (authError) {
      setError(authErrorMessage(authError));
      return;
    }
    navigate(state.from?.pathname ?? routes.home, { replace: true });
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Use your authorized email and password."
      footer={
        <Link to={routes.forgotPassword} className="text-burgundy hover:underline">
          Forgot password?
        </Link>
      }
    >
      {state.notice && (
        <div className="mb-4 text-[13px] text-success bg-success-light border border-success/30 px-3 py-2 rounded-lg">
          {state.notice}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5" noValidate>
        <TextInput
          type="email"
          label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="username"
          required
        />
        <TextInput
          type="password"
          label="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error && (
          <div className="text-[13px] text-danger bg-danger-light border border-danger/30 px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <Button type="submit" size="lg" loading={submitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
