/**
 * Theme switching for the design-system library.
 *
 * Colours live in the generated `theme.css`; this module only chooses which
 * block applies by setting `data-theme` on <html>. No colour maths at runtime.
 */
export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const THEME_KEY = 'vault-theme';

export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
  preference === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : preference;

export const getThemePreference = (): ThemePreference => {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
  } catch {
    return 'system';
  }
};

export const applyTheme = (preference: ThemePreference): ResolvedTheme => {
  const resolved = resolveTheme(preference);
  document.documentElement.dataset.theme = resolved;
  try {
    localStorage.setItem(THEME_KEY, preference);
  } catch {
    // Theme still applies when storage is unavailable.
  }
  return resolved;
};
