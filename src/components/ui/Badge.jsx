import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'border-gray-300 bg-gray-100 text-gray-900',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning: 'border-amber-200 bg-amber-50 text-amber-800',
        danger: 'border-red-200 bg-red-50 text-red-700',
        info: 'border-blue-200 bg-blue-50 text-blue-700'
      }
    },
    defaultVariants: { variant: 'default' }
  }
)

export function Badge({ variant, className, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
