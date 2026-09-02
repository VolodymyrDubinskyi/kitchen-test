import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'

const AUTO_DISMISS_MS = 5000

export type ToastTone = 'success' | 'error'

export type Toast = {
  id: number
  tone: ToastTone
  message: string
}

type ToastState = {
  toasts: Toast[]
  nextId: number
}

type ToastAction =
  | { type: 'toast-shown'; tone: ToastTone; message: string }
  | { type: 'toast-dismissed'; id: number }

const initialState: ToastState = { toasts: [], nextId: 1 }

export function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'toast-shown':
      return {
        toasts: [...state.toasts, { id: state.nextId, tone: action.tone, message: action.message }],
        nextId: state.nextId + 1,
      }
    case 'toast-dismissed':
      return { ...state, toasts: state.toasts.filter(toast => toast.id !== action.id) }
  }
}

type ToastApi = {
  showSuccess: (message: string) => void
  showError: (message: string) => void
  dismiss: (id: number) => void
}

const ToastStateContext = createContext<Toast[] | null>(null)
const ToastApiContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, initialState)
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: number) => dispatch({ type: 'toast-dismissed', id }), [])

  const api = useMemo<ToastApi>(
    () => ({
      showSuccess: message => dispatch({ type: 'toast-shown', tone: 'success', message }),
      showError: message => dispatch({ type: 'toast-shown', tone: 'error', message }),
      dismiss,
    }),
    [dismiss],
  )

  useEffect(() => {
    const scheduled = timers.current
    const live = new Set(state.toasts.map(toast => toast.id))

    for (const [id, timer] of scheduled) {
      if (!live.has(id)) {
        clearTimeout(timer)
        scheduled.delete(id)
      }
    }

    for (const toast of state.toasts) {
      if (scheduled.has(toast.id) || toast.tone === 'error') {
        continue
      }

      scheduled.set(
        toast.id,
        setTimeout(() => dispatch({ type: 'toast-dismissed', id: toast.id }), AUTO_DISMISS_MS),
      )
    }
  }, [state.toasts])

  useEffect(() => {
    const scheduled = timers.current

    return () => {
      for (const timer of scheduled.values()) {
        clearTimeout(timer)
      }

      scheduled.clear()
    }
  }, [])

  return (
    <ToastApiContext.Provider value={api}>
      <ToastStateContext.Provider value={state.toasts}>{children}</ToastStateContext.Provider>
    </ToastApiContext.Provider>
  )
}

export function useToasts(): Toast[] {
  const toasts = useContext(ToastStateContext)

  if (!toasts) {
    throw new Error('useToasts must be used within a ToastProvider')
  }

  return toasts
}

export function useToast(): ToastApi {
  const api = useContext(ToastApiContext)

  if (!api) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return api
}
