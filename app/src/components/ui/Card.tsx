import { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

const CARD_BASE = 'bg-white border border-line rounded-2xl shadow-soft';

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx(CARD_BASE, className)} {...rest}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function CardHeader({ title, actions, className, children }: CardHeaderProps) {
  return (
    <div className={clsx('flex items-center justify-between px-[22px] py-[18px] border-b border-cream-dark', className)}>
      {children ?? (title && <h3 className="font-serif text-lg text-ink">{title}</h3>)}
      {actions}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={clsx('px-[22px] py-[18px]', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardToolbar({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'flex items-stretch gap-2.5 px-[18px] py-4 border-b border-cream-dark flex-wrap',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
