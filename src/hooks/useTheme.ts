import { useEffect, useState } from 'react';

type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'lista-compras-theme';

const getPreferredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
  if (stored === 'light' || stored === 'dark') return stored;

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
};

export const useTheme = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme());

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const body = document.body;
    if (theme === 'dark') {
      body.classList.add('theme-dark');
    } else {
      body.classList.remove('theme-dark');
    }

    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
};

