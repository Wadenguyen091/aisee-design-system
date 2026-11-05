import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import {
  RiAddLine, RiCheckLine, RiDeleteBinFill, RiDeleteBinLine, RiDraggable, RiEditFill, RiEditLine, RiFileCopyFill, RiFileCopyLine,
  RiInformationLine, RiLockFill, RiLockUnlockFill, RiMoreFill, RiPaletteLine,
} from '@remixicon/react';
import { VaultBadge, VaultButton, VaultButtonGroup, VaultField, VaultSearch, VaultTooltip } from '../base/VaultControls';
import { VaultEmptyState } from '../base/VaultContent';
import { VaultDialog, VaultDialogBody, VaultMenu, VaultMenuItem, VaultMenuSeparator } from '../base/VaultOverlays';
import { VaultColorField, VaultSlider } from '../base/VaultColorInputs';
import {
  contrastRatio, createColorScale, hexToHsl, hexToRgb, hslToHex, normalizeHex, readableInk, rgbToHex,
  VAULT_INK_DARK, VAULT_INK_LIGHT, wcagGrade, wcagTone, type VaultHsl,
} from '../base/colorMath';
import './ApplicationComponents.css';

/*
 * Colour application components — the patterns Pallet repeats (colour cards, the primitive list,
 * the HSL / RGB adjuster, 11-step scales, contrast pairs, token rows), built only from base.
 * Colours shown here are DATA (user swatches); the chrome around them uses theme tokens only.
 */

export type ApplicationColorItem = { id: string; name: string; hex: string; role?: string; locked?: boolean };

const ROLE_BY_INDEX = ['Primary', 'Secondary', 'Tertiary'];
/** Pallet order rule: 1st = Primary, 2nd = Secondary, 3rd = Tertiary, the rest Accent. */
export const colorRoleForIndex = (index: number) => ROLE_BY_INDEX[index] ?? 'Accent';

const makeId = () => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `color-${Date.now()}-${Math.random().toString(16).slice(2)}`;
const swatchStyle = (hex: string) => ({ '--application-swatch': hex, '--application-swatch-ink': readableInk(hex) }) as CSSProperties;

/** Copy with feedback that only claims success when the copy really happened. */
function useCopy(duration = 1600) {
  const [copied, setCopied] = useState('');
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  const copy = async (value: string, key = value) => {
    let done = false;
    try { await navigator.clipboard.writeText(value); done = true; } catch {
      const area = document.createElement('textarea');
      area.value = value; area.setAttribute('readonly', ''); area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select();
      try { done = document.execCommand('copy'); } catch { done = false; }
      area.remove();
    }
    if (!done) return;
    setCopied(key);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(''), duration);
  };
  return { copied, copy };
}

function ContrastBadge({ background, foreground, label }: { background: string; foreground: string; label?: string }) {
  const ratio = contrastRatio(background, foreground);
  const grade = wcagGrade(ratio);
  return <VaultBadge tone={wcagTone(grade)}>{`${label ? `${label} ` : ''}${grade} ${ratio.toFixed(1)}`}</VaultBadge>;
}

/* --------------------------------------------------------------- Colour dialog */

/** Create / edit one colour: name + HEX (swatch opens the native picker). */
export function ApplicationColorDialog({ open, onClose, initial, onSave, inline = false }: {
  open: boolean;
  onClose: () => void;
  /** Omit to create a new colour. */
  initial?: Pick<ApplicationColorItem, 'name' | 'hex'>;
  onSave: (value: { name: string; hex: string }) => void;
  inline?: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [hex, setHex] = useState(initial?.hex ?? '#4F7CFF');
  const [error, setError] = useState('');
  useEffect(() => { if (open) { setName(initial?.name ?? ''); setHex(initial?.hex ?? '#4F7CFF'); setError(''); } }, [open, initial?.name, initial?.hex]);
  const save = () => {
    if (!name.trim()) { setError('Đặt tên cho màu, ví dụ Ocean Blue'); return; }
    onSave({ name: name.trim(), hex: normalizeHex(hex) ?? hex });
  };
  return <VaultDialog
    inline={inline}
    open={open}
    onClose={onClose}
    size="sm"
    icon={<RiPaletteLine />}
    title={initial ? 'Sửa màu' : 'Màu mới'}
    description={initial ? initial.name : 'Đặt tên và chọn mã màu.'}
    footer={<><VaultButton appearance="ghost" onClick={onClose}>Hủy</VaultButton><VaultButton priority="primary" tone="brand" onClick={save}>{initial ? 'Lưu' : 'Thêm màu'}</VaultButton></>}
  >
    <VaultDialogBody>
      <form className="application-color-form" onSubmit={event => { event.preventDefault(); save(); }}>
        <VaultField label="Tên màu" showLabel autoFocus placeholder="Ocean Blue" value={name} error={error || undefined} onChange={event => { setName(event.target.value); setError(''); }} />
        <VaultColorField label="Mã màu" showLabel value={hex} onChange={setHex} />
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>
    </VaultDialogBody>
  </VaultDialog>;
}

/* ----------------------------------------------------------------- Colour card */

/**
 * Colour card ("thẻ màu") — inherits the Pallet swatch tile, tightened to the 4 grid:
 * a solid colour tile, padding 12, ink chosen for legibility on the colour itself.
 * Top: label 12/16 (step or name), then the Base badge (its row is kept so tiles in a row align).
 * Bottom: HEX and WCAG grade as ink badges (pill 24). Min height 136.
 * Click selects when onSelect is given (double-click copies, like Pallet); otherwise click copies.
 * Selected = 2px ink rail at the bottom; no outline, no lift.
 */
export function ApplicationColorCard({ label, hex, base = false, selected = false, onSelect, className = '' }: {
  label: string;
  hex: string;
  base?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
}) {
  const { copied, copy } = useCopy();
  const value = normalizeHex(hex) ?? hex;
  const ink = readableInk(value);
  const ratio = contrastRatio(ink, value);
  const grade = wcagGrade(ratio);
  return <button
    type="button"
    className={`application-color-card ${className}`.trim()}
    data-selected={selected || undefined}
    aria-pressed={onSelect ? selected : undefined}
    aria-label={`${label}, ${value}, ${grade} ${ratio.toFixed(1)}${base ? ', màu gốc' : ''}. ${onSelect ? 'Bấm để chọn, bấm đúp để copy' : 'Bấm để copy'}`}
    title={`${grade} · tỷ lệ ${ratio.toFixed(1)}:1`}
    style={swatchStyle(value)}
    onClick={() => { if (onSelect) onSelect(); else void copy(value); }}
    onDoubleClick={onSelect ? () => void copy(value) : undefined}
  >
    <strong>{label}</strong>
    <span className="application-color-card__base">{base && <VaultBadge tone="ink">Base</VaultBadge>}</span>
    <span className="application-color-card__meta">
      <VaultBadge tone="ink">{copied ? 'Đã copy' : value}</VaultBadge>
      <VaultBadge tone="ink">{grade}</VaultBadge>
    </span>
  </button>;
}


const DEMO_COLORS: ApplicationColorItem[] = [
  { id: 'c-primary', name: 'Vault Red', hex: '#E5484D', locked: true },
  { id: 'c-secondary', name: 'Ocean Blue', hex: '#3E63DD' },
  { id: 'c-tertiary', name: 'Moss', hex: '#5A8F3D' },
  { id: 'c-accent', name: 'Sand', hex: '#D9B98C' },
];

/** Cards for a set of named colours: auto-fill columns ≥ 96, gap 8 (Pallet spacing). Click selects, double-click copies. */
export function ApplicationColorCardGrid({ colors = DEMO_COLORS }: { colors?: ApplicationColorItem[] }) {
  const [selected, setSelected] = useState(colors[0]?.id ?? '');
  return <div className="application-color-grid" role="group" aria-label="Thẻ màu">
    {colors.map((color, index) => <ApplicationColorCard key={color.id} label={color.role ?? (color.name || colorRoleForIndex(index))} hex={color.hex} base={index === 0} selected={selected === color.id} onSelect={() => setSelected(color.id)} />)}
  </div>;
}


/* ----------------------------------------------------------------- Colour list */

/**
 * Primitive colour list (Pallet sidebar). Rows 56: drag handle, swatch 32 (lock glyph when locked), name + role, HEX badge,
 * overflow menu (lock · copy · edit · delete). Reorder by dragging the handle or ↑ ↓ on it; order sets
 * the role (Primary, Secondary, Tertiary, Accent).
 */
export function ApplicationColorList({ colors: controlled, defaultColors = DEMO_COLORS, onChange, selectedId: controlledSelected, onSelect, title = 'Màu primitive', actions }: {
  colors?: ApplicationColorItem[];
  /** Extra header actions before "Thêm màu" (e.g. a regenerate button). */
  actions?: ReactNode;
  defaultColors?: ApplicationColorItem[];
  onChange?: (colors: ApplicationColorItem[]) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
  title?: string;
}) {
  const [own, setOwn] = useState(defaultColors);
  const colors = controlled ?? own;
  const setColors = (next: ApplicationColorItem[]) => { if (!controlled) setOwn(next); onChange?.(next); };
  const [ownSelected, setOwnSelected] = useState(defaultColors[0]?.id ?? '');
  const selectedId = controlledSelected ?? ownSelected;
  const select = (id: string) => { if (controlledSelected === undefined) setOwnSelected(id); onSelect?.(id); };
  const [menuFor, setMenuFor] = useState('');
  const [editing, setEditing] = useState<ApplicationColorItem | null | 'new'>(null);
  const [dragging, setDragging] = useState('');
  const [dropTarget, setDropTarget] = useState('');
  const [announcement, setAnnouncement] = useState('');
  const handles = useRef(new Map<string, HTMLButtonElement>());
  const { copy } = useCopy();

  const move = (id: string, to: number) => {
    const from = colors.findIndex(item => item.id === id);
    if (from < 0 || to < 0 || to >= colors.length || from === to) return;
    const next = [...colors];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setColors(next);
    setAnnouncement(`${moved.name}: vị trí ${to + 1}, ${colorRoleForIndex(to)}`);
    requestAnimationFrame(() => handles.current.get(id)?.focus());
  };
  const onHandleKey = (event: KeyboardEvent<HTMLButtonElement>, id: string, index: number) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    move(id, index + (event.key === 'ArrowUp' ? -1 : 1));
  };
  const endDrag = () => {
    if (dragging && dropTarget && dragging !== dropTarget) move(dragging, colors.findIndex(item => item.id === dropTarget));
    setDragging(''); setDropTarget('');
  };

  return <section className="application-panel is-framed application-color-list">
    <header className="application-panel__header">
      <span><strong>{title}</strong><VaultBadge>{colors.length}</VaultBadge></span>
      <span>{actions}<VaultButton appearance="ghost" size="sm" icon={<RiAddLine />} onClick={() => setEditing('new')}>Thêm màu</VaultButton></span>
    </header>
    {colors.length ? <div
      className="application-list"
      role="list"
      aria-label={title}
      onPointerMove={event => {
        if (!dragging) return;
        const row = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-color-id]');
        if (row?.dataset.colorId) setDropTarget(row.dataset.colorId);
      }}
      onPointerUp={endDrag}
      onPointerCancel={() => { setDragging(''); setDropTarget(''); }}
    >
      {colors.map((color, index) => {
        const role = color.role ?? colorRoleForIndex(index);
        return <div
          role="listitem"
          key={color.id}
          data-color-id={color.id}
          className="application-color-row"
          data-selected={selectedId === color.id || undefined}
          data-dragging={dragging === color.id || undefined}
          data-drop={dropTarget === color.id && dragging !== color.id || undefined}
          style={swatchStyle(color.hex)}
        >
          <button
            type="button"
            ref={node => { if (node) handles.current.set(color.id, node); else handles.current.delete(color.id); }}
            className="application-color-row__handle"
            aria-label={`Đổi vị trí ${color.name}, đang ở vị trí ${index + 1}. Dùng phím mũi tên lên xuống`}
            onPointerDown={event => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setDragging(color.id); setDropTarget(''); }}
            onKeyDown={event => onHandleKey(event, color.id, index)}
          ><RiDraggable aria-hidden="true" /></button>
          <button type="button" className="application-color-row__select" aria-current={selectedId === color.id || undefined} onClick={() => select(color.id)}>
            <span className="application-color-row__dot" aria-hidden="true">{color.locked && <RiLockFill />}</span>
            <span className="application-list__copy"><strong>{color.name}</strong><small>{color.locked ? `${role} · Đã khóa` : role}</small></span>
            <VaultBadge>{color.hex}</VaultBadge>
          </button>
          <span className="application-color-row__more">
            <VaultButton appearance="text" size="sm" iconOnly icon={<RiMoreFill />} aria-label={`Tùy chọn ${color.name}`} aria-haspopup="menu" aria-expanded={menuFor === color.id} onClick={() => setMenuFor(current => current === color.id ? '' : color.id)} />
            {menuFor === color.id && <VaultMenu label={`Tùy chọn ${color.name}`} autoFocus onClose={() => setMenuFor('')} className="application-color-row__menu">
              <VaultMenuItem icon={color.locked ? <RiLockUnlockFill /> : <RiLockFill />} onSelect={() => { setColors(colors.map(item => item.id === color.id ? { ...item, locked: !item.locked } : item)); setMenuFor(''); setAnnouncement(`${color.name}: ${color.locked ? 'đã mở khóa' : 'đã khóa'}`); }}>{color.locked ? 'Mở khóa' : 'Khóa khi đề xuất'}</VaultMenuItem>
              <VaultMenuItem icon={<RiFileCopyFill />} onSelect={() => { void copy(color.hex); setMenuFor(''); }}>Copy mã màu</VaultMenuItem>
              <VaultMenuItem icon={<RiEditFill />} onSelect={() => { setEditing(color); setMenuFor(''); }}>Sửa</VaultMenuItem>
              <VaultMenuSeparator />
              <VaultMenuItem icon={<RiDeleteBinFill />} tone="danger" onSelect={() => { setColors(colors.filter(item => item.id !== color.id)); setMenuFor(''); }}>Xóa</VaultMenuItem>
            </VaultMenu>}
          </span>
        </div>;
      })}
    </div> : <VaultEmptyState art="inbox" title="Chưa có màu" description="Thêm màu đầu tiên để tạo bảng màu." action={<VaultButton priority="primary" tone="brand" icon={<RiAddLine />} onClick={() => setEditing('new')}>Thêm màu</VaultButton>} />}
    <span className="sr-only" aria-live="polite">{announcement}</span>
    <ApplicationColorDialog
      open={editing !== null}
      onClose={() => setEditing(null)}
      initial={editing && editing !== 'new' ? editing : undefined}
      onSave={value => {
        if (editing === 'new') { const next = { id: makeId(), ...value }; setColors([...colors, next]); select(next.id); }
        else if (editing) setColors(colors.map(item => item.id === editing.id ? { ...item, ...value } : item));
        setEditing(null);
      }}
    />
  </section>;
}

/* -------------------------------------------------------------- Colour adjust */

type AdjustMode = 'hsl' | 'rgb';

/**
 * Colour adjuster ("thanh chỉnh màu"). Header 64: swatch chip 40 + name, HSL / RGB switch.
 * Body: HEX field, then three colour-track sliders. Then contrast badges for white and dark ink on the colour.
 */
export function ApplicationColorAdjust({ name = 'Primary', value, defaultValue = '#E5484D', onChange, disabled = false }: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (hex: string) => void;
  disabled?: boolean;
}) {
  const [own, setOwn] = useState(normalizeHex(defaultValue) ?? '#E5484D');
  const hex = normalizeHex(value ?? '') ?? own;
  const [mode, setMode] = useState<AdjustMode>('hsl');
  // Keep HSL as state so hue survives greys (s = 0) and black / white.
  const [hsl, setHsl] = useState<VaultHsl>(() => hexToHsl(hex));
  useEffect(() => { setHsl(current => hslToHex(current) === hex ? current : hexToHsl(hex)); }, [hex]);
  const emit = (next: string) => { if (value === undefined) setOwn(next); onChange?.(next); };
  const setChannel = (key: keyof VaultHsl, channel: number) => { const next = { ...hsl, [key]: channel }; setHsl(next); emit(hslToHex(next)); };
  const rgb = hexToRgb(hex);
  const setRgb = (key: 'r' | 'g' | 'b', channel: number) => emit(rgbToHex({ ...rgb, [key]: channel }));
  const { h, s, l } = hsl;
  const hueStops = [0, 60, 120, 180, 240, 300, 360].map(stop => `hsl(${stop} ${Math.max(s, 40)}% ${Math.min(Math.max(l, 35), 65)}%)`).join(',');
  const rgbTrack = (key: 'r' | 'g' | 'b') => {
    const at = (channel: number) => `rgb(${key === 'r' ? channel : rgb.r} ${key === 'g' ? channel : rgb.g} ${key === 'b' ? channel : rgb.b})`;
    return `linear-gradient(90deg,${at(0)},${at(255)})`;
  };
  return <section className="application-panel is-framed application-color-adjust" aria-label={`Chỉnh màu ${name}`} style={swatchStyle(hex)} data-disabled={disabled || undefined}>
    <header className="application-color-adjust__header">
      <VaultColorField label={`Mã màu ${name}`} value={hex} onChange={emit} disabled={disabled} />
      <VaultButtonGroup value={mode} onChange={setMode} label="Hệ màu" size="sm" options={[{ value: 'hsl', label: 'HSL' }, { value: 'rgb', label: 'RGB' }]} />
    </header>
    <div className="application-color-adjust__body">
      {mode === 'hsl' ? <>
        <VaultSlider label="Hue" unit="°" min={0} max={359} value={h} disabled={disabled} track={`linear-gradient(90deg,${hueStops})`} onChange={next => setChannel('h', next)} />
        <VaultSlider label="Saturation" unit="%" value={s} disabled={disabled} track={`linear-gradient(90deg,hsl(${h} 0% ${l}%),hsl(${h} 100% ${l}%))`} onChange={next => setChannel('s', next)} />
        <VaultSlider label="Lightness" unit="%" value={l} disabled={disabled} track={`linear-gradient(90deg,hsl(${h} ${s}% 0%),hsl(${h} ${s}% 50%),hsl(${h} ${s}% 100%))`} onChange={next => setChannel('l', next)} />
      </> : <>
        <VaultSlider label="Red" min={0} max={255} value={rgb.r} disabled={disabled} track={rgbTrack('r')} onChange={next => setRgb('r', next)} />
        <VaultSlider label="Green" min={0} max={255} value={rgb.g} disabled={disabled} track={rgbTrack('g')} onChange={next => setRgb('g', next)} />
        <VaultSlider label="Blue" min={0} max={255} value={rgb.b} disabled={disabled} track={rgbTrack('b')} onChange={next => setRgb('b', next)} />
      </>}
    </div>
    <footer className="application-color-adjust__footer">
      <ContrastBadge label="Chữ trắng" background={hex} foreground={VAULT_INK_LIGHT} />
      <ContrastBadge label="Chữ đen" background={hex} foreground={VAULT_INK_DARK} />
    </footer>
  </section>;
}

/* --------------------------------------------------------------- Colour scale */

/** 11-step scale (50 → 950, 500 = the colour) as a row of colour cards, like Pallet. Click copies. Narrower than 11 × 88 the row scrolls with snap. */
export function ApplicationColorScale({ name, hex, shades, caption, selected = false, onSelect }: {
  name: string;
  /** Seed colour; ignored when `shades` is given. */
  hex?: string;
  /** Pre-computed steps (e.g. from the Pallet engine). Defaults to createColorScale(hex). */
  shades?: Array<{ step: number; hex: string }>;
  caption?: ReactNode;
  selected?: boolean;
  /** When given, a tile click selects this scale (double-click copies), like Pallet. */
  onSelect?: () => void;
}) {
  const scale = useMemo(() => shades ?? createColorScale(hex ?? '#808080'), [shades, hex]);
  return <section className="application-color-scale" aria-label={`Thang màu ${name}`} data-selected={selected || undefined}>
    <header><strong>{name}</strong>{caption && <small>{caption}</small>}{selected && <VaultBadge>Đang chọn</VaultBadge>}</header>
    <div className="application-color-scale__row">
      {scale.map(shade => <ApplicationColorCard key={shade.step} label={String(shade.step)} hex={shade.hex} base={shade.step === 500} onSelect={onSelect} />)}
    </div>
  </section>;
}

/* ------------------------------------------------------------- Contrast pairs */

export type ApplicationContrastPair = { name: string; background: string; foreground: string };
export type ApplicationContrastSet = { value: string; label: string; pairs: ApplicationContrastPair[] };

const DEMO_CONTRAST: ApplicationContrastSet[] = [
  { value: 'semantic', label: 'Semantic', pairs: [
    { name: 'Alert', background: '#FDE8E8', foreground: '#B42318' },
    { name: 'Warning', background: '#FEF3D7', foreground: '#93590C' },
    { name: 'Success', background: '#E3F5E7', foreground: '#1D6B34' },
    { name: 'Info', background: '#E4EDFE', foreground: '#2550B8' },
  ] },
  { value: 'category', label: 'Category', pairs: [
    { name: 'Coral', background: '#F26B5B', foreground: '#111111' },
    { name: 'Amber', background: '#F2B33D', foreground: '#111111' },
    { name: 'Lime', background: '#8CC63E', foreground: '#111111' },
    { name: 'Cyan', background: '#2AA8C4', foreground: '#111111' },
    { name: 'Indigo', background: '#4B4FC9', foreground: '#FFFFFF' },
  ] },
];

/** Background / text pairs with their WCAG grade and ratio. Rows 56; click copies the background. */
export function ApplicationContrastList({ title = 'Gợi ý màu', sets = DEMO_CONTRAST, value, onValueChange, action }: {
  title?: string;
  sets?: ApplicationContrastSet[];
  /** Controlled active set. */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Extra header action (e.g. regenerate the active set). */
  action?: ReactNode;
}) {
  const [ownValue, setOwnValue] = useState(sets[0]?.value ?? '');
  const setValue = value ?? ownValue;
  const setSetValue = (next: string) => { if (value === undefined) setOwnValue(next); onValueChange?.(next); };
  const { copied, copy } = useCopy();
  const active = sets.find(set => set.value === setValue) ?? sets[0];
  return <section className="application-panel is-framed application-contrast-list">
    <header className="application-panel__header">
      <strong>{title}</strong>
      <span>{action}{sets.length > 1 && <VaultButtonGroup value={setValue} onChange={setSetValue} label="Loại gợi ý" size="sm" options={sets.map(set => ({ value: set.value, label: set.label }))} />}</span>
    </header>
    <div className="application-list" role="list">
      {active?.pairs.map(pair => {
        const ratio = contrastRatio(pair.background, pair.foreground);
        const grade = wcagGrade(ratio);
        return <div role="listitem" key={pair.name}>
          <button type="button" className="application-contrast-row" title={`Nền ${pair.background} · Chữ ${pair.foreground}`} aria-label={`${pair.name}: nền ${pair.background}, chữ ${pair.foreground}, ${grade} ${ratio.toFixed(1)}. Bấm để copy nền`} onClick={() => void copy(pair.background, pair.name)}>
            <span className="application-contrast-row__sample" style={{ background: pair.background, color: pair.foreground }} aria-hidden="true">Aa</span>
            <strong>{pair.name}</strong>
            <span className="application-badges"><VaultBadge tone={wcagTone(grade)}>{grade}</VaultBadge><VaultBadge>{`${ratio.toFixed(1)}:1`}</VaultBadge></span>
            <span className="application-copy-icon" aria-hidden="true">{copied === pair.name ? <RiCheckLine /> : <RiFileCopyLine />}</span>
          </button>
        </div>;
      })}
    </div>
  </section>;
}

/* ----------------------------------------------------------------- Token list */

export type ApplicationToken = {
  token: string;
  hex: string;
  source: string;
  opacity?: number;
  /** Use case, shown under the name. */
  note?: string;
  /** Contrast ratio against its paired surface; shown as a WCAG badge. */
  contrast?: number;
  /** Replaces the WCAG grade text (e.g. "UI" for category colours). */
  contrastLabel?: string;
  /** What a click copies. Defaults to var(--token). */
  copyValue?: string;
};

const DEMO_TOKENS: ApplicationToken[] = [
  { token: 'text/heading', hex: '#111111', source: 'neutral/950' },
  { token: 'text/body', hex: '#3A3A3A', source: 'neutral/800' },
  { token: 'text/muted', hex: '#737373', source: 'neutral/500' },
  { token: 'system-bg/fg-base', hex: '#F7F7F7', source: 'neutral/50' },
  { token: 'subtle-bg/brand-primary', hex: '#E5484D', source: 'primitive/primary' },
  { token: 'border/alpha-neutral', hex: '#111111', source: 'neutral/950', opacity: 6 },
  { token: 'semantic/success-light', hex: '#E3F5E7', source: 'success/100' },
  { token: 'category/indigo-dark', hex: '#4B4FC9', source: 'category/indigo' },
];

/** Token rows 48 (table): swatch, namespace/name, source badge, copy. Search filters by token, source or HEX. */
export function ApplicationTokenList({ title = 'Application variables', tokens = DEMO_TOKENS, defaultQuery = '', searchable = true, description }: {
  title?: string;
  tokens?: ApplicationToken[];
  defaultQuery?: string;
  searchable?: boolean;
  /** Short help for the group, shown as a tooltip on an info icon. */
  description?: string;
}) {
  const [query, setQuery] = useState(defaultQuery);
  const { copied, copy } = useCopy();
  const needle = query.trim().toLowerCase();
  const rows = tokens.filter(token => !needle || `${token.token} ${token.source} ${token.hex}`.toLowerCase().includes(needle));
  return <section className="application-panel is-framed application-token-list">
    <header className="application-panel__header application-token-list__header">
      <span><strong>{title}</strong><VaultBadge>{needle ? `${rows.length}/${tokens.length}` : tokens.length}</VaultBadge>{description && <VaultTooltip label={description} placement="bottom"><span className="application-info" tabIndex={0} role="img" aria-label={description}><RiInformationLine /></span></VaultTooltip>}</span>
      {searchable && <VaultSearch label="Tìm token" placeholder="Tìm token…" value={query} onChange={event => setQuery(event.target.value)} onClear={() => setQuery('')} />}
    </header>
    {rows.length ? <div className="application-list" role="list">
      {rows.map(token => {
        const [namespace, short] = token.token.includes('/') ? [token.token.slice(0, token.token.indexOf('/') + 1), token.token.slice(token.token.indexOf('/') + 1)] : ['', token.token];
        const value = token.opacity ? `color-mix(in srgb, ${token.hex} ${token.opacity}%, transparent)` : token.hex;
        const grade = token.contrast ? wcagGrade(token.contrast) : null;
        return <div role="listitem" key={token.token}>
          <button type="button" className="application-token-row" data-note={token.note ? '' : undefined} title={token.copyValue ? `Copy ${token.copyValue}` : undefined} aria-label={`${token.token}, ${token.hex}${token.opacity ? ` ${token.opacity}%` : ''}, nguồn ${token.source}${token.note ? `, ${token.note}` : ''}${grade ? `, ${token.contrastLabel ?? grade} ${token.contrast!.toFixed(1)}` : ''}. Bấm để copy`} onClick={() => void copy(token.copyValue ?? `var(--${token.token.replace(/\//g, '-')})`, token.token)}>
            <span className="application-token-row__swatch" style={{ '--application-swatch': value } as CSSProperties} aria-hidden="true" />
            <span className="application-token-row__copy"><span className="application-token-row__name"><i>{namespace}</i>{short}</span>{token.note && <small>{token.note}</small>}</span>
            <span className="application-badges">{grade && <VaultBadge tone={wcagTone(grade)}>{`${token.contrastLabel ?? grade} ${token.contrast!.toFixed(1)}`}</VaultBadge>}<VaultBadge>{token.opacity ? `${token.source} · ${token.opacity}%` : token.source}</VaultBadge></span>
            <span className="application-copy-icon" aria-hidden="true">{copied === token.token ? <RiCheckLine /> : <RiFileCopyLine />}</span>
          </button>
        </div>;
      })}
    </div> : <VaultEmptyState art="search" title="Không có token khớp" description="Thử tên token hoặc nguồn khác." />}
  </section>;
}
