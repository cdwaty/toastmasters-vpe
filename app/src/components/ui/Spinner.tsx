import clsx from 'clsx';

const SIZE_CLASSES = {
  sm: 'w-3.5 h-3.5 border-2',
  md: 'w-[18px] h-[18px] border-2',
  lg: 'w-7 h-7 border-[3px]',
} as const;

interface SpinnerProps {
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
  label?: string;
}

export function Spinner({ size = 'md', className, label }: SpinnerProps) {
  return (
    <span
      className={clsx('inline-flex items-center gap-2', className)}
      role="status"
      aria-label={label ?? 'Loading'}
    >
      <span
        className={clsx(
          'inline-block rounded-full border-cream-dark border-t-burgundy animate-spin',
          SIZE_CLASSES[size],
        )}
        aria-hidden="true"
      />
      {label && <span className="text-sm text-ink-mid">{label}</span>}
    </span>
  );
}
