import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple className strings into one,
 * automatically resolving Tailwind conflicts.
 * Example:
 * cn('px-2 py-2', condition && 'bg-red-500')
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
