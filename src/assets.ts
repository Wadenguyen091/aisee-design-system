/** Resolve a file from /public against the app's base URL, so images work when
 * the app is served from a sub-path (preview links, sub-folder deploys).
 * Production with base '/' returns the path unchanged. */
const base = (import.meta.env?.BASE_URL ?? '/').replace(/\/$/, '');

export const publicAsset = (path: string): string =>
  path.startsWith('/') && !path.startsWith('//') ? `${base}${path}` : path;
