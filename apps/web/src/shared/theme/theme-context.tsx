import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'

export const THEME_COOKIE = 'kitchen-theme'
export const THEMES = ['light', 'dark'] as const
export const DEFAULT_THEME: Theme = 'light'

const COOKIE_PATTERN = new RegExp(`(?:^|;\\s*)${THEME_COOKIE}=(light|dark)(?:;|$)`)
const ONE_YEAR_SECONDS = 31_536_000

export type Theme = (typeof THEMES)[number]

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && THEMES.includes(value as Theme)
}

export function readThemeCookie(cookieHeader: string | undefined): Theme {
  const match = cookieHeader?.match(COOKIE_PATTERN)

  return isTheme(match?.[1]) ? match[1] : DEFAULT_THEME
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme?: Theme
  children: ReactNode
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme ?? DEFAULT_THEME)
  const knownFromServer = useRef(initialTheme !== undefined)

  useEffect(() => {
    if (!knownFromServer.current) {
      knownFromServer.current = true
      setThemeState(readThemeCookie(document.cookie))

      return
    }

    document.documentElement.dataset.theme = theme
    document.cookie = `${THEME_COOKIE}=${theme}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`
  }, [theme])

  const setTheme = useCallback((next: Theme) => setThemeState(next), [])

  const toggleTheme = useCallback(
    () => setThemeState(current => (current === 'light' ? 'dark' : 'light')),
    [],
  )

  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }

  return context
}
