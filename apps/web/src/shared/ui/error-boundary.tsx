import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  fallback: ReactNode
  children: ReactNode
}

type State = {
  failed: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  override state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
