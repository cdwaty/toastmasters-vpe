import { HTMLAttributes, ReactNode, ThHTMLAttributes } from 'react';
import clsx from 'clsx';

export function TableWrap({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={clsx('overflow-x-auto', className)}>{children}</div>;
}

export function Table({ className, children, ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <table className={clsx('w-full border-collapse', className)} {...rest}>
      {children}
    </table>
  );
}

export function TableHead({ children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-burgundy-dark" {...rest}>
      {children}
    </thead>
  );
}

interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableCellElement> {
  sortable?: boolean;
  sortIcon?: ReactNode;
}

export function TableHeaderCell({
  sortable, sortIcon, className, children, onClick, ...rest
}: TableHeaderCellProps) {
  return (
    <th
      onClick={onClick}
      className={clsx(
        'text-left whitespace-nowrap px-4 py-3.5 text-[11px] font-semibold uppercase tracking-eyebrow text-white/85',
        sortable && 'cursor-pointer select-none hover:text-white',
        className,
      )}
      {...rest}
    >
      {children}
      {sortable && sortIcon && (
        <span className="ml-1.5 text-gold-light text-[10px]">{sortIcon}</span>
      )}
    </th>
  );
}

export function TableRow({ className, children, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={clsx(
        'border-b border-cream-dark transition-colors [tbody_&]:hover:bg-rowhover',
        className,
      )}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function TableCell({ className, children, ...rest }: HTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={clsx('px-4 py-3 text-sm text-ink-mid align-middle', className)} {...rest}>
      {children}
    </td>
  );
}
