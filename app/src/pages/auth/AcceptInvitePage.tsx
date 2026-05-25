import { Link, useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { authErrorMessage } from '../../lib/authErrors';
import { routes } from '../../lib/routes';
import { UserPlusIcon } from '../../components/ui';
import { AuthShell } from './AuthShell';
import { SetPasswordForm } from './SetPasswordForm';
import { useAuthLinkSession } from './useAuthLinkSession';

export function AcceptInvitePage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const ready = useAuthLinkSession();

  const handleSubmit = async (password: string) => {
    const { error } = await updatePassword(password);
    if (error) return authErrorMessage(error);
    navigate(routes.home, { replace: true });
    return null;
  };

  if (ready === 'checking') {
    return (
      <AuthShell title="Activating your account…">
        <div className="flex justify-center py-4">
          <div className="w-8 h-8 border-2 border-burgundy/20 border-t-burgundy rounded-full animate-spin" />
        </div>
      </AuthShell>
    );
  }
  if (ready === 'invalid') {
    return (
      <AuthShell
        title="Invite expired"
        subtitle="This invitation link is invalid or has expired. Ask your administrator to resend it."
        footer={<Link to={routes.login} className="text-burgundy hover:underline font-medium">Back to sign in</Link>}
      />
    );
  }
  return (
    <AuthShell
      icon={<UserPlusIcon size={26} />}
      title="Set your password"
      subtitle="Welcome to Toastmasters. Choose a password to finish setting up your account."
    >
      <SetPasswordForm submitLabel="Activate account" onSubmit={handleSubmit} />
    </AuthShell>
  );
}
