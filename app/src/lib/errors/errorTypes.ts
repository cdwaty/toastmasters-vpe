export type ErrorCategory =
  | 'auth'
  | 'database'
  | 'validation'
  | 'import'
  | 'network'
  | 'unknown';

export interface AppError {
  category: ErrorCategory;
  message: string;
  detail?: string;
  cause?: unknown;
}

export function createAppError(
  category: ErrorCategory,
  message: string,
  options: { detail?: string; cause?: unknown } = {},
): AppError {
  return { category, message, detail: options.detail, cause: options.cause };
}
