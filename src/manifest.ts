/**
 * Typed access to the generated token manifest. The manifest documents exactly
 * what `theme.css` ships; the Design System page renders from it.
 */
import raw from './tokens.manifest.json';

export type ThemeMode = 'light' | 'dark';
export type TokenGroup = 'Primitive' | 'Semantic' | 'Text' | 'Category' | 'System BG' | 'Subtle BG' | 'Border';

export interface TokenEntry {
  group: TokenGroup;
  token: string;
  source: string;
  hex: string;
  note: string;
  contrast?: number;
  alias?: string;
  opacity?: number;
}

export interface ShadeEntry {
  step: number;
  hex: string;
  contrastOnWhite: number;
  contrastOnBlack: number;
  foreground: string;
}

export interface PrimitiveEntry {
  id: string;
  name: string;
  hex: string;
  role?: string;
  scale: ShadeEntry[];
}

export interface DesignSystemManifest {
  version: 1;
  source: 'Pallet';
  exportedAt: string;
  primitives: PrimitiveEntry[];
  modes: Record<ThemeMode, TokenEntry[]>;
}

export const tokenManifest = raw as DesignSystemManifest;
