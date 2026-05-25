import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="px-5 py-16 text-center text-ink-light">
      {icon && <div className="mb-3 inline-flex items-center justify-center text-ink-light/70">{icon}</div>}
      <h3 className="font-serif text-lg text-ink mb-1.5">{title}</h3>
      {description && <p className="text-sm max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
