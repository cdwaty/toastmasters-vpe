import { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}

export function AuthShell({ title, subtitle, icon, children, footer }: AuthShellProps) {
  return (
    <div className="min-h-screen grid place-items-center p-6 bg-gradient-to-b from-cream to-[#f5ede2]">
      <div className="w-full max-w-md bg-white border border-line rounded-2xl p-8 shadow-pop">
        <div className="flex items-center gap-3.5 mb-8">
          <div className="w-12 h-12 rounded-full bg-gold text-burgundy-dark font-serif text-xl flex items-center justify-center shrink-0">
            TM
          </div>
          <div className="min-w-0">
            <div className="font-serif text-xl text-ink leading-tight">Toastmasters</div>
            <div className="text-[11px] uppercase tracking-caps text-ink-light/80 mt-0.5">
              Club Executive Platform
            </div>
          </div>
        </div>
        {icon && (
          <div className="flex justify-center mb-4 text-burgundy">
            <div className="w-14 h-14 rounded-full bg-burgundy/10 inline-flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        <h1 className="font-serif text-2xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink-mid mt-1.5 mb-6">{subtitle}</p>}
        {!subtitle && <div className="mb-6" />}
        {children}
        {footer && <div className="mt-6 pt-5 border-t border-cream-dark text-sm text-ink-light text-center">{footer}</div>}
      </div>
    </div>
  );
}
