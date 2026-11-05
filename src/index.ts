/**
 * Visal Design System — public entry point.
 *
 *   tokens    theme.css (generated from Pallet) + tokens.css (scales, semantic aliases)
 *   base/     building blocks every app has (button, field, tabs, badge, charts…)
 *   application/  composed patterns built only from base (profile menu, data table…)
 *
 * The library imports nothing from the app or from Pallet. Check with `npm run ds:check`.
 * Styles for other projects: import './design-system/styles.css'.
 */
export * from './base';
export * from './application';
export * from './icons';
export * from './theme';
export { tokenManifest } from './manifest';
export type { DesignSystemManifest, PrimitiveEntry, ShadeEntry, TokenEntry, TokenGroup, ThemeMode } from './manifest';
