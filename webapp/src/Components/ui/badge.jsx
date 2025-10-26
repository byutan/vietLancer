import React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from './utils'

const base = 'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden'

const VARIANT_CLASSES = {
  default: 'border-transparent bg-primary text-primary-foreground',
  secondary: 'border-transparent bg-secondary text-secondary-foreground',
  destructive:
    'border-transparent bg-destructive text-white focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
  outline: 'text-foreground',
}

export function Badge({ className, variant = 'default', asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(base, VARIANT_CLASSES[variant] || VARIANT_CLASSES.default, className)}
      {...props}
    />
  )
}

export default Badge
