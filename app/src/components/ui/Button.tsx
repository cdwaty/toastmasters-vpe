import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner';

const VARIANT_CLASSES = {
  primary: 'bg-burgundy text-white hover:bg-burgundy-light',
  secondary: 'bg-white text-ink-mid border border-line hover:bg-cream',
  danger: 'bg-danger text-white border border-danger hover:opacity-90 shadow-soft',
  ghost: 'bg-transparent text-ink-mid hover:bg-cream',
} as const;

const SIZE_CLASSES = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-[13px]',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-[15px]',
} as const;

const BASE = [
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium font-sans',
  'transition-all whitespace-nowrap',
  'disabled:opacity-55 disabled:cursor-not-allowed',
  'enabled:hover:-translate-y-px',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy/40',
].join(' ');

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_CLASSES;
  size?: keyof typeof SIZE_CLASSES;
  loading?: boolean;
  icon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', loading, icon, className, children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(BASE, VARIANT_CLASSES[variant], SIZE_CLASSES[size], loading && 'cursor-wait', className)}
      {...rest}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
});
