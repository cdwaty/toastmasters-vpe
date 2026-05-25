import { InputHTMLAttributes, forwardRef, ReactNode, useId } from 'react';
import clsx from 'clsx';
import { FIELD_BASE, INPUT_BASE, INPUT_ERROR, LABEL_BASE } from './styles';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leadingIcon?: ReactNode;
  requiredMark?: boolean;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, hint, error, leadingIcon, requiredMark, id, className, ...rest },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <div className={FIELD_BASE}>
      {label && (
        <label htmlFor={inputId} className={LABEL_BASE}>
          {label}
          {requiredMark && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light pointer-events-none">
            {leadingIcon}
          </span>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(INPUT_BASE, leadingIcon && 'pl-9', error && INPUT_ERROR, className)}
          aria-invalid={!!error}
          {...rest}
        />
      </div>
      {error
        ? <p className="text-xs text-danger">{error}</p>
        : hint && <p className="text-xs text-ink-light">{hint}</p>}
    </div>
  );
});
