import { useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { Topbar } from './Topbar';
import { Sidebar } from './Sidebar';
import { Button, XIcon } from './ui';
import { ConnectionBanner } from './ConnectionBanner';
import { ErrorBoundary } from './ErrorBoundary';

const SHELL_CLASS = [
  'grid min-h-screen',
  '[grid-template-rows:64px_1fr]',
  '[grid-template-columns:240px_1fr] [grid-template-areas:"top_top""side_main"]',
  'max-md:[grid-template-columns:1fr] max-md:[grid-template-areas:"top""main"]',
].join(' ');

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <ConnectionBanner />
      <div className={`${SHELL_CLASS} flex-1`}>
        <Topbar onMenuClick={() => setMobileOpen(true)} />

        <aside className="[grid-area:side] sticky top-16 h-[calc(100vh-64px)] bg-white border-r border-line max-md:hidden">
          <Sidebar />
        </aside>

        {mobileOpen && (
          <div className="fixed inset-0 z-[200] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
            <div
              className="absolute inset-0 bg-ink/50"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-pop animate-slideIn flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-line">
                <span className="font-serif text-base text-ink">Navigation</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-md hover:bg-cream"
                  aria-label="Close navigation"
                >
                  <XIcon size={20} />
                </button>
              </div>
              <Sidebar key={location.key} onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="[grid-area:main] p-8 max-md:p-5 w-full">
          <ErrorBoundary
            key={location.pathname}
            fallback={(error, reset) => (
              <div className="max-w-xl bg-white border border-line rounded-2xl p-7 shadow-soft">
                <h2 className="font-serif text-xl text-ink">Something went wrong on this page</h2>
                <p className="text-sm text-ink-light mt-1 mb-5">{error.message}</p>
                <div className="flex gap-2">
                  <Button onClick={reset}>Try again</Button>
                  <Button variant="secondary" onClick={() => window.history.back()}>Go back</Button>
                </div>
              </div>
            )}
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
