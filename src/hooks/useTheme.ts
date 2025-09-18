import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

export function useTheme() {
  const dispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.ui.theme);

  useEffect(() => {
    // Load theme from localStorage on mount
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | 'system' | null;
    if (savedTheme) {
      dispatch(setTheme(savedTheme));
    }
  }, [dispatch]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let effectiveTheme = theme;

    if (theme === 'system') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(effectiveTheme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const themes = ['light', 'dark'] as const;
    const currentIndex = themes.indexOf(theme as 'light' | 'dark');
    // If current theme is 'system' or not found, default to switching to opposite of system preference
    if (currentIndex === -1) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      dispatch(setTheme(systemPrefersDark ? 'light' : 'dark'));
    } else {
      const nextIndex = (currentIndex + 1) % themes.length;
      dispatch(setTheme(themes[nextIndex]));
    }
  };

  const setThemeMode = (newTheme: 'light' | 'dark' | 'system') => {
    dispatch(setTheme(newTheme));
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeMode,
  };
}
