/*
 * Colour maths for colour *data* (user-picked swatches, uploaded images, token values).
 * Never used to compute the app theme: theme colours come only from theme.css.
 */

export type VaultRgb = { r: number; g: number; b: number };
export type VaultHsl = { h: number; s: number; l: number };
export type VaultWcagGrade = 'AAA' | 'AA' | 'AA Large' | 'Fail';
export type VaultScaleStep = { step: number; hex: string; ink: string; contrast: number; grade: VaultWcagGrade };

/** Ink colours used on top of arbitrary user colours (data, not theme). */
export const VAULT_INK_DARK = '#111111';
export const VAULT_INK_LIGHT = '#FFFFFF';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** '#abc' | 'abc' | '#aabbcc' → '#AABBCC'; anything else → null. */
export function normalizeHex(value: string): string | null {
  const raw = value.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(raw)) return `#${raw.split('').map(char => char + char).join('')}`.toUpperCase();
  if (/^[0-9a-f]{6}$/i.test(raw)) return `#${raw}`.toUpperCase();
  return null;
}

export function hexToRgb(hex: string): VaultRgb {
  const value = normalizeHex(hex) ?? '#000000';
  return { r: parseInt(value.slice(1, 3), 16), g: parseInt(value.slice(3, 5), 16), b: parseInt(value.slice(5, 7), 16) };
}

export function rgbToHex({ r, g, b }: VaultRgb): string {
  return `#${[r, g, b].map(channel => Math.round(clamp(channel, 0, 255)).toString(16).padStart(2, '0')).join('')}`.toUpperCase();
}

export function rgbToHsl({ r, g, b }: VaultRgb): VaultHsl {
  const red = r / 255, green = g / 255, blue = b / 255;
  const max = Math.max(red, green, blue), min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: Math.round(lightness * 100) };
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hue = max === red ? (green - blue) / delta + (green < blue ? 6 : 0) : max === green ? (blue - red) / delta + 2 : (red - green) / delta + 4;
  return { h: Math.round(hue * 60) % 360, s: Math.round(saturation * 100), l: Math.round(lightness * 100) };
}

export function hslToRgb({ h, s, l }: VaultHsl): VaultRgb {
  const saturation = clamp(s, 0, 100) / 100, lightness = clamp(l, 0, 100) / 100;
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const hue = ((h % 360) + 360) % 360 / 60;
  const x = chroma * (1 - Math.abs(hue % 2 - 1));
  const [red, green, blue] = hue < 1 ? [chroma, x, 0] : hue < 2 ? [x, chroma, 0] : hue < 3 ? [0, chroma, x] : hue < 4 ? [0, x, chroma] : hue < 5 ? [x, 0, chroma] : [chroma, 0, x];
  const m = lightness - chroma / 2;
  return { r: (red + m) * 255, g: (green + m) * 255, b: (blue + m) * 255 };
}

export const hexToHsl = (hex: string) => rgbToHsl(hexToRgb(hex));
export const hslToHex = (hsl: VaultHsl) => rgbToHex(hslToRgb(hsl));

function relativeLuminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const linear = (channel: number) => { const value = channel / 255; return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** WCAG 2 contrast ratio between two colours (1–21). */
export function contrastRatio(a: string, b: string) {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

export function wcagGrade(ratio: number): VaultWcagGrade {
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Fail';
}

export function wcagTone(grade: VaultWcagGrade): 'success' | 'warning' | 'danger' {
  return grade === 'AAA' || grade === 'AA' ? 'success' : grade === 'AA Large' ? 'warning' : 'danger';
}

/** The more readable of dark / light ink on a colour. */
export function readableInk(hex: string) {
  return contrastRatio(VAULT_INK_DARK, hex) >= contrastRatio(VAULT_INK_LIGHT, hex) ? VAULT_INK_DARK : VAULT_INK_LIGHT;
}

export function mixHex(a: string, b: string, weightOfB: number) {
  const from = hexToRgb(a), to = hexToRgb(b);
  return rgbToHex({ r: from.r + (to.r - from.r) * weightOfB, g: from.g + (to.g - from.g) * weightOfB, b: from.b + (to.b - from.b) * weightOfB });
}

export const VAULT_SCALE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const TINT = [0.92, 0.84, 0.66, 0.48, 0.26];
const SHADE = [0.16, 0.32, 0.48, 0.62, 0.76];

/** 11-step scale around a base colour (500 = the colour itself): tints toward white, shades toward black. */
export function createColorScale(hex: string): VaultScaleStep[] {
  const base = normalizeHex(hex) ?? '#808080';
  return VAULT_SCALE_STEPS.map((step, index) => {
    const value = index < 5 ? mixHex(base, '#FFFFFF', TINT[index]) : index === 5 ? base : mixHex(base, '#000000', SHADE[index - 6]);
    const ink = readableInk(value);
    const contrast = contrastRatio(ink, value);
    return { step, hex: value, ink, contrast, grade: wcagGrade(contrast) };
  });
}
