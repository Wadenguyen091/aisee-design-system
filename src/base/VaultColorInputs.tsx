import { useEffect, useId, useState, type CSSProperties, type ReactNode } from 'react';
import { VaultBadge } from './VaultControls';
import { normalizeHex } from './colorMath';

/**
 * Slider — native range input on the 4px grid. Head row 24 (label + value badge), hit area 24.
 * Plain track: 4px, filled with text colour up to the value. `track` (any CSS gradient) turns it
 * into an 8px colour track (hue, saturation, lightness…).
 */
export function VaultSlider({ label, value, onChange, min = 0, max = 100, step = 1, unit = '', track, showLabel = true, showValue = true, icon, disabled = false, className = '' }: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Suffix in the value badge (%, °, px…). */
  unit?: string;
  /** CSS background for a colour track, e.g. `linear-gradient(90deg, …)`. */
  track?: string;
  showLabel?: boolean;
  showValue?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  className?: string;
}) {
  const progress = max === min ? 0 : (value - min) / (max - min) * 100;
  const style = { '--vault-slider-progress': `${progress}%`, ...(track ? { '--vault-slider-track': track } : {}) } as CSSProperties;
  return <label className={`vault-slider ${className}`.trim()} data-track={track ? 'color' : undefined} data-disabled={disabled || undefined} style={style}>
    {(showLabel || showValue) && <span className="vault-slider__head">
      <span className={showLabel ? undefined : 'sr-only'}>{icon}{label}</span>
      {showValue && <VaultBadge>{`${Math.round(value * 100) / 100}${unit}`}</VaultBadge>}
    </span>}
    <input type="range" min={min} max={max} step={step} value={value} disabled={disabled} aria-label={label} aria-valuetext={`${value}${unit}`} onChange={event => onChange(Number(event.target.value))} />
  </label>;
}

/**
 * Colour field — pill 40 like VaultField: a round 24 swatch that opens the native picker, then the HEX code.
 * Only HEX digits can be typed. Typing commits at 6 digits; a 3-digit code expands on blur;
 * anything else reverts on blur.
 */
export function VaultColorField({ label, value, onChange, showLabel = false, hint, error, disabled = false, id, className = '' }: {
  label: string;
  /** '#RRGGBB'. */
  value: string;
  onChange: (hex: string) => void;
  showLabel?: boolean;
  hint?: string;
  /** External validation message (e.g. duplicate colour). */
  error?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
}) {
  const autoId = useId();
  const fieldId = id || `vault-color-${autoId.replace(/:/g, '')}`;
  const current = normalizeHex(value) ?? '#000000';
  const [draft, setDraft] = useState(current.slice(1));
  useEffect(() => { setDraft(current.slice(1)); }, [current]);
  const message = error || hint;
  const swatch = draft.length === 6 ? normalizeHex(draft) ?? current : current;
  return <label className={`vault-field vault-color-field ${error ? 'is-invalid' : ''} ${className}`.trim()} htmlFor={fieldId} data-labelled={showLabel || undefined}>
    {showLabel && <span className="vault-field__label">{label}</span>}
    <span className="vault-field__control">
      <span className="vault-color-field__swatch" style={{ '--vault-swatch': swatch } as CSSProperties}>
        <input type="color" value={current.toLowerCase()} disabled={disabled} aria-label={`${label}: mở bảng chọn màu`} onChange={event => onChange(event.target.value.toUpperCase())} />
      </span>
      <span className="vault-color-field__hash" aria-hidden="true">#</span>
      <input
        id={fieldId}
        value={draft}
        disabled={disabled}
        maxLength={6}
        spellCheck={false}
        autoComplete="off"
        aria-label={`${label} (HEX)`}
        aria-invalid={error ? true : undefined}
        aria-describedby={message ? `${fieldId}-message` : undefined}
        onChange={event => {
          const next = event.target.value.replace(/[^0-9a-f]/gi, '').slice(0, 6).toUpperCase();
          setDraft(next);
          const hex = normalizeHex(next);
          if (hex && next.length === 6) onChange(hex);
        }}
        onBlur={() => { const hex = normalizeHex(draft); if (hex) onChange(hex); else setDraft(current.slice(1)); }}
      />
    </span>
    {message && <small id={`${fieldId}-message`} className="vault-field__message">{message}</small>}
  </label>;
}
