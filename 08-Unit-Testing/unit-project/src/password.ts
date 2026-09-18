export interface PasswordResult {
  valid: boolean;
  errors: string[];
}

/**
 * Rules: 8–20 characters, at least 1 digit, at least 1 uppercase letter, no spaces.
 */
export function validatePassword(password: string): PasswordResult {
  const errors: string[] = [];

  if (password.length < 8) errors.push('Too short');
  if (password.length > 20) errors.push('Too long');
  if (!/\d/.test(password)) errors.push('Needs a digit');
  if (!/[A-Z]/.test(password)) errors.push('Needs an uppercase letter');
  if (/\s/.test(password)) errors.push('No spaces allowed');

  return { valid: errors.length === 0, errors };
}
