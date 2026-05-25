import clsx from 'clsx';

interface ProgressBarProps {
  value: number;
  max?: number;
  complete?: boolean;
  label?: string;
}

export function ProgressBar({ value, max = 100, complete, label }: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.min(100, Math.max(0, (value / max) * 100));
  const isComplete = complete ?? percent >= 100;
  return (
    <div>
      {label && (
        <div className="flex items-center justify-between text-xs text-ink-light mb-1.5">
          <span>{label}</span>
          <span className="tabular-nums">{Math.round(percent)}%</span>
        </div>
      )}
      <div
        className="w-full h-2 bg-cream-dark rounded overflow-hidden"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
      >
        <div
          className={clsx(
            'h-full transition-[width,background-color] duration-300 ease-out',
            isComplete ? 'bg-success' : 'bg-burgundy',
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
