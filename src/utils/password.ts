/**
 * Generate a temporary password for password recovery
 * @returns A random 6-character uppercase alphanumeric string
 */
export const generateTempPassword = (): string => {
  return Math.random().toString(36).slice(-6).toUpperCase();
};
