import type { AnchorHTMLAttributes } from 'react'

import Link from 'next/link'

import { BUTTON_BASE_CLASS, BUTTON_VARIANTS, type ButtonVariant } from './button-style'

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  variant?: ButtonVariant
}

export function LinkButton({
  href,
  variant = 'primary',
  className = '',
  ...props
}: LinkButtonProps) {
  return (
    <Link
      {...props}
      href={href}
      className={`${BUTTON_BASE_CLASS} ${BUTTON_VARIANTS[variant]} ${className}`}
    />
  )
}
