import type { ButtonHTMLAttributes, Ref } from 'react'

import { BUTTON_BASE_CLASS, BUTTON_VARIANTS, type ButtonVariant } from './button-style'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  ref?: Ref<HTMLButtonElement>
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`${BUTTON_BASE_CLASS} ${BUTTON_VARIANTS[variant]} ${className}`}
    />
  )
}
