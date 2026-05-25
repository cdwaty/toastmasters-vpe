import { ReactNode, cloneElement, isValidElement, useId } from 'react';
import { FIELD_BASE, LABEL_BASE } from './styles';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ label, htmlFor, hint, error, required, children }: FormFieldProps) {
  const reactId = useId();
  const fieldId = htmlFor ?? reactId;

  let renderedChild = children;
  if (!htmlFor && isValidElement(children) && (children.props as { id?: string }).id === undefined) {
    renderedChild = cloneElement(children as React.ReactElement<{ id?: string }>, { id: fieldId });
  }

  return (
    <div className={FIELD_BASE}>
      <label className={LABEL_BASE} htmlFor={fieldId}>
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {renderedChild}
      {error
        ? <p className="text-xs text-danger" role="alert">{error}</p>
        : hint && <p className="text-xs text-ink-light">{hint}</p>}
    </div>
  );
}
