import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'minddeck-theme-dark';

export type ThemeContextValue = {
  dark: boolean;
  setDark: (value: boolean) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDarkState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    try {
      localStorage.setItem(STORAGE_KEY, dark ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, [dark]);

  const setDark = useCallback((value: boolean) => {
    setDarkState(value);
  }, []);

  const toggle = useCallback(() => {
    setDarkState((d) => !d);
  }, []);

  const value = useMemo(() => ({ dark, setDark, toggle }), [dark, setDark, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return ctx;
}
