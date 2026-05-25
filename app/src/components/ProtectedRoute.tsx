import { Navigate, useLocation } from 'react-router';
import { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { routes } from '../lib/routes';
import { PageLoader } from './ui';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <PageLoader variant="full" />;
  if (!user) return <Navigate to={routes.login} state={{ from: loc }} replace />;
  return <>{children}</>;
}
