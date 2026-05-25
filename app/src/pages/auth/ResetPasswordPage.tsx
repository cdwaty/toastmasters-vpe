import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { authErrorMessage } from '../../lib/authErrors';
import { supabase } from '../../lib/supabase';
import { routes } from '../../lib/routes';
import { LockIcon } from '../../components/ui';
import { AuthShell } from './AuthShell';
import { SetPasswordForm } from './SetPasswordForm';
import { useAuthLinkSession } from './useAuthLinkSession';

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const ready = useAuthLinkSession();

  const handleSubmit = async (password: string) => {
    const { error } = await updatePassword(password);
    if (error) return authErrorMessage(error);
    await supabase.auth.signOut();
    navigate(routes.login, { replace: true, state: { notice: 'Password updated. Please sign in.' } });
    return null;
  };

  if (ready === 'checking') {
    return (
      <AuthShell title="Verifying link…">
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        </div>
      </AuthShell>
    );
  }
  if (ready === 'invalid') {
    return (
      <AuthShell
        title="Link expired"
        subtitle="This password reset link is invalid or has expired. Request a new one."
        footer={<Link to={routes.forgotPassword} className="text-burgundy hover:underline font-medium">Request new link</Link>}
      />
    );
  }
  return (
    <AuthShell
      icon={<LockIcon size={26} />}
      title="Set new password"
      subtitle="Choose a new password for your account."
    >
      <SetPasswordForm submitLabel="Update password" onSubmit={handleSubmit} />
    </AuthShell>
  );
}
