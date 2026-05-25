import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MemberProvider } from './contexts/MemberContext';
import { MeetingProvider } from './contexts/MeetingContext';
import { PathwayProvider } from './contexts/PathwayContext';
import { ReferenceDataProvider } from './contexts/ReferenceDataContext';
import { ToastProvider } from './contexts/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './components/AppLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/auth/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { AcceptInvitePage } from './pages/auth/AcceptInvitePage';
import { DashboardPage } from './pages/DashboardPage';
import { RosterPage } from './pages/members/RosterPage';
import { MemberDetailPage } from './pages/members/MemberDetailPage';
import { AddMemberPage } from './pages/members/AddMemberPage';
import { BulkUpdatePage } from './pages/members/BulkUpdatePage';
import { MeetingsPage } from './pages/meetings/MeetingsPage';
import { MeetingDetailPage } from './pages/meetings/MeetingDetailPage';
import { MeetingFormPage } from './pages/meetings/MeetingFormPage';
import { ReportsPage, AdminPage } from './pages/Stubs';
import { ExportPage } from './pages/data/ExportPage';
import { routes } from './lib/routes';

function AuthenticatedShell() {
  const { user } = useAuth();
  return (
    <ReferenceDataProvider key={user?.id ?? 'anon'}>
      <MemberProvider>
        <MeetingProvider>
          <PathwayProvider>
            <AppLayout />
          </PathwayProvider>
        </MeetingProvider>
      </MemberProvider>
    </ReferenceDataProvider>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <Routes>
              <Route path={routes.login} element={<LoginPage />} />
              <Route path={routes.forgotPassword} element={<ForgotPasswordPage />} />
              <Route path={routes.resetPassword} element={<ResetPasswordPage />} />
              <Route path={routes.authCallback} element={<AcceptInvitePage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <AuthenticatedShell />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="members" element={<RosterPage />} />
                <Route path="members/add" element={<AddMemberPage />} />
                <Route path="members/bulk" element={<BulkUpdatePage />} />
                <Route path="members/:id" element={<MemberDetailPage />} />
                <Route path="meetings" element={<MeetingsPage />} />
                <Route path="meetings/new" element={<MeetingFormPage />} />
                <Route path="meetings/:id" element={<MeetingDetailPage />} />
                <Route path="meetings/:id/edit" element={<MeetingFormPage />} />
                <Route path="data/export" element={<ExportPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="admin" element={<AdminPage />} />
              </Route>

              <Route path="*" element={<Navigate to={routes.home} replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
