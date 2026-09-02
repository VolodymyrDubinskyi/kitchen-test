import { useSyncExternalStore, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const subscribe = () => () => undefined
const onClient = () => true
const onServer = () => false

export function useIsMounted(): boolean {
  return useSyncExternalStore(subscribe, onClient, onServer)
}

export function Portal({ children }: { children: ReactNode }) {
  return useIsMounted() ? createPortal(children, document.body) : null
}
