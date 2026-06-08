import { clsx, type ClassValue } from 'clsx';

/**
 * Combine class names. NativeWind resolves conflicting Tailwind classes itself,
 * so the web-oriented `tailwind-merge` is intentionally omitted.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
