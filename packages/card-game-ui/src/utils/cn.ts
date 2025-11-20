import clsx, { ClassValue } from 'clsx';

/**
 * Utility for conditionally joining classNames
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
