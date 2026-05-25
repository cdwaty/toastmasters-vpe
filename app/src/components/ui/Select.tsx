import { SelectHTMLAttributes, forwardRef, useId } from 'react';
import clsx from 'clsx';
import { FIELD_BASE, INPUT_BASE, INPUT_ERROR, LABEL_BASE } from './styles';

const CHEVRON_SVG =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='none' stroke='%238A7B70' stroke-width='1.5' d='M1 1l4 4 4-4'/%3E%3C/svg%3E\")";

const CHEVRON_STYLE = {
  appearance: 'none' as const,
  backgroundImage: CHEVRON_SVG,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 14px center',
  paddingRight: 36,
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options?: SelectOption[];
  groups?: SelectOptionGroup[];
  placeholder?: string;
  requiredMark?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, options, groups, placeholder, requiredMark, id, className, style, ...rest },
  ref,
) {
  const reactId = useId();
  const selectId = id ?? reactId;
  return (
    <div className={FIELD_BASE}>
      {label && (
        <label htmlFor={selectId} className={LABEL_BASE}>
          {label}
          {requiredMark && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        ref={ref}
        style={{ ...CHEVRON_STYLE, ...style }}
        className={clsx(INPUT_BASE, error && INPUT_ERROR, className)}
        aria-invalid={!!error}
        {...rest}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {groups
          ? groups.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </optgroup>
            ))
          : options?.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
      </select>
      {error
        ? <p className="text-xs text-danger">{error}</p>
        : hint && <p className="text-xs text-ink-light">{hint}</p>}
    </div>
  );
});
