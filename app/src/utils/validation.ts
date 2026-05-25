export const PASSWORD_MIN_LENGTH = 8;

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function validatePassword(pw: string): string | null {
  if (!PASSWORD_PATTERN.test(pw)) {
    return 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.';
  }
  return null;
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
  return null;
}
