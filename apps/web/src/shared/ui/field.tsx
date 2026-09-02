import {
  useId,
  useState,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from 'react'

const CONTROL_CLASS =
  'w-full rounded-md border px-3 py-2 text-sm outline-none transition-colors border-zinc-300 bg-white text-zinc-900 focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-zinc-300 aria-[invalid=true]:border-red-500'

function FieldShell({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> & {
  label: string
  error?: string
  ref?: Ref<HTMLInputElement>
}

export function TextField({ label, error, ...props }: TextFieldProps) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} error={error}>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={CONTROL_CLASS}
      />
    </FieldShell>
  )
}

type TextAreaFieldProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> & {
  label: string
  error?: string
  ref?: Ref<HTMLTextAreaElement>
}

export function TextAreaField({ label, error, ...props }: TextAreaFieldProps) {
  const id = useId()

  return (
    <FieldShell id={id} label={label} error={error}>
      <textarea
        {...props}
        id={id}
        rows={4}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={CONTROL_CLASS}
      />
    </FieldShell>
  )
}

type NumberFieldProps = {
  label: string
  error?: string
  name: string
  value: number | undefined
  onValueChange: (value: number | undefined) => void
  onBlur: () => void
  ref?: Ref<HTMLInputElement>
}

function toText(value: number | undefined): string {
  return typeof value === 'number' && Number.isFinite(value) ? String(value) : ''
}

const DECIMAL_PATTERN = /^-?(\d+([.]\d*)?|[.]\d+)$/

export function parseDecimal(raw: string): number | undefined {
  const compact = raw.replace(/[\s\u00a0\u202f]/g, '')

  if (compact === '') {
    return undefined
  }

  const normalized = compact.replace(',', '.')

  if (normalized.includes(',') || !DECIMAL_PATTERN.test(normalized)) {
    return Number.NaN
  }

  return Number(normalized)
}

export function NumberField({
  label,
  error,
  value,
  onValueChange,
  onBlur,
  name,
  ref,
}: NumberFieldProps) {
  const id = useId()
  const [text, setText] = useState(() => toText(value))
  const [lastValue, setLastValue] = useState(value)

  if (!Object.is(lastValue, value)) {
    setLastValue(value)

    if (!Object.is(parseDecimal(text), value)) {
      setText(toText(value))
    }
  }

  const change = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value)
    onValueChange(parseDecimal(event.target.value))
  }

  return (
    <FieldShell id={id} label={label} error={error}>
      <input
        id={id}
        name={name}
        ref={ref}
        type="text"
        inputMode="decimal"
        value={text}
        onBlur={onBlur}
        onChange={change}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={CONTROL_CLASS}
      />
    </FieldShell>
  )
}
