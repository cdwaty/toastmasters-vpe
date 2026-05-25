import clsx from 'clsx';

const VALUE_COLOR = {
  default: 'text-burgundy',
  info: 'text-info',
  warning: 'text-warning',
  success: 'text-success',
} as const;

interface StatCardProps {
  label: string;
  value: string | number;
  variant?: keyof typeof VALUE_COLOR;
  description?: string;
}

export function StatCard({ label, value, variant = 'default', description }: StatCardProps) {
  return (
    <div className="bg-white border border-line rounded-xl px-5 py-4 shadow-soft">
      <div className="text-xs uppercase tracking-label text-ink-light font-medium">
        {label}
      </div>
      <div className={clsx('font-serif text-[32px] leading-none mt-1', VALUE_COLOR[variant])}>
        {value}
      </div>
      {description && <div className="text-xs text-ink-light mt-1">{description}</div>}
    </div>
  );
}
