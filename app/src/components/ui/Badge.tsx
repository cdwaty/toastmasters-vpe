import clsx from 'clsx';
import { HTMLAttributes } from 'react';

const TONE_CLASSES = {
  neutral: 'bg-[#F5F0EA] text-ink-light before:bg-ink-light',
  success: 'bg-success-light text-success before:bg-success',
  info: 'bg-info-light text-info before:bg-info',
  warning: 'bg-warning-light text-warning before:bg-warning',
  danger: 'bg-danger-light text-danger before:bg-danger',
  tahi: 'bg-accent-light text-accent before:bg-accent',
  yarning: 'bg-[#FDF5E6] text-[#8A6A20] before:bg-gold',
} as const;

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: keyof typeof TONE_CLASSES;
}

const BASE = [
  'inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full',
  'text-xs font-medium whitespace-nowrap',
  "before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full before:shrink-0",
].join(' ');

export function Badge({ tone = 'neutral', className, children, ...rest }: BadgeProps) {
  return (
    <span className={clsx(BASE, TONE_CLASSES[tone], className)} {...rest}>
      {children}
    </span>
  );
}
