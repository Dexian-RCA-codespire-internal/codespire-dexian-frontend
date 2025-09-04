import React from 'react'
import { cn } from '../../lib/utils'

const base =
  'block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-0 placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 disabled:opacity-60'

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(base, className)} {...props} />
})
