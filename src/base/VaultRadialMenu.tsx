import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type WheelEvent } from 'react';
import { RiArrowDownLine, RiArrowUpLine, RiCloseLine, RiStopFill } from '@remixicon/react';

export type VaultRadialItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Short trailing word, e.g. a state ("Tạm dừng") or a count. */
  hint?: string;
  disabled?: boolean;
  onSelect: () => void;
};
export type VaultRadialGroup = { id: string; label: string; icon: ReactNode; items: VaultRadialItem[] };

const RING = 220;
const SEG_IN = 108;
const SEG_OUT = 188;
const GAP = 12;
const STEP = 13;
const REACH = 296;
const ITEM_H = 52;

const polar = (radius: number, deg: number) => {
  const rad = deg * Math.PI / 180;
  return `${(Math.cos(rad) * radius).toFixed(2)} ${(Math.sin(rad) * radius).toFixed(2)}`;
};
/** Annular sector with parallel cuts: the gap between segments is the same width at every radius. */
function sector(center: number, span: number) {
  const half = span / 2;
  const cut = (radius: number) => Math.asin(GAP / 2 / radius) * 180 / Math.PI;
  const a0o = center - half + cut(SEG_OUT), a1o = center + half - cut(SEG_OUT);
  const a0i = center - half + cut(SEG_IN), a1i = center + half - cut(SEG_IN);
  const large = a1o - a0o > 180 ? 1 : 0;
  return `M${polar(SEG_OUT, a0o)} A${SEG_OUT} ${SEG_OUT} 0 ${large} 1 ${polar(SEG_OUT, a1o)} L${polar(SEG_IN, a1i)} A${SEG_IN} ${SEG_IN} 0 ${large} 0 ${polar(SEG_IN, a0i)} Z`;
}

function useCompact(query = '(max-width: 719px)') {
  const [compact, setCompact] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const list = window.matchMedia(query);
    const sync = () => setCompact(list.matches);
    sync();
    list.addEventListener('change', sync);
    return () => list.removeEventListener('change', sync);
  }, [query]);
  return compact;
}

/**
 * Radial command menu (after VEX's HUD menu). A dial of groups on the left — the chosen group turns to face the
 * list — and the group's items fanned along an arc on the right, the focused one level with the dial and tied to it
 * by a connector; items fade and blur with distance. A control column closes, steps up / down and runs the focused
 * item. Keys: ↑ ↓ (or the wheel) move, ← → change group, Enter runs, Esc closes. Under 720px the dial sits on top
 * and the items stack in a straight wheel below it. `inline` renders it in place (DS page, review) instead of over
 * the page.
 */
export function VaultRadialMenu({ open, onClose, groups, initialGroup, label = 'Menu', inline = false }: {
  open: boolean;
  onClose: () => void;
  groups: VaultRadialGroup[];
  /** Group shown when the menu opens. */
  initialGroup?: string;
  label?: string;
  inline?: boolean;
}) {
  const compact = useCompact();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const wheelDelta = useRef(0);
  const startIndex = Math.max(0, groups.findIndex(group => group.id === initialGroup));
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [focusFor, setFocusFor] = useState<Record<string, number>>({});
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!open) return;
    setGroupIndex(startIndex);
    if (!inline) {
      returnTo.current = document.activeElement as HTMLElement | null;
      window.requestAnimationFrame(() => panel.current?.focus());
      return () => { returnTo.current?.focus?.(); };
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open || compact) return;
    const fit = () => {
      const box = inline ? panel.current?.getBoundingClientRect() : { width: window.innerWidth, height: window.innerHeight };
      if (!box) return;
      setScale(Math.max(0.6, Math.min(1, (box.width - 112) / 840, (box.height - 32) / 600)));
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [open, compact, inline]);

  const group = groups[Math.min(groupIndex, groups.length - 1)];
  const items = useMemo(() => group?.items ?? [], [group]);
  const focus = Math.min(focusFor[group?.id ?? ''] ?? 0, Math.max(0, items.length - 1));
  if (!open || !group) return null;

  const span = 360 / groups.length;
  const facing = compact ? 90 : 0;
  const turn = facing - groupIndex * span;
  const setFocus = (next: number) => setFocusFor(map => ({ ...map, [group.id]: Math.max(0, Math.min(items.length - 1, next)) }));
  const move = (delta: number) => setFocus(focus + delta);
  const switchGroup = (delta: number) => setGroupIndex(index => (index + delta + groups.length) % groups.length);
  const run = (index = focus) => {
    const item = items.at(index);
    if (!item || item.disabled) return;
    onClose();
    item.onSelect();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, () => void> = {
      ArrowUp: () => move(-1), ArrowDown: () => move(1), ArrowLeft: () => switchGroup(-1), ArrowRight: () => switchGroup(1),
      Home: () => setFocus(0), End: () => setFocus(items.length - 1), Enter: () => run(), Escape: () => onClose(),
    };
    const action = keys[event.key];
    if (!action) return;
    if (event.key === 'Enter' && (event.target as HTMLElement).closest('.vault-radial__control, .vault-radial__segment')) return;
    event.preventDefault();
    action();
  };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    wheelDelta.current += event.deltaY;
    if (Math.abs(wheelDelta.current) < 48) return;
    move(wheelDelta.current > 0 ? 1 : -1);
    wheelDelta.current = 0;
  };

  const ring = <svg className="vault-radial__ring" viewBox={`${-RING} ${-RING} ${RING * 2} ${RING * 2}`} aria-hidden={false}>
    <defs>
      <pattern id={`vault-radial-hatch-${uid}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="6" className="vault-radial__hatch" />
      </pattern>
    </defs>
    <circle className="vault-radial__rim" r={RING - 4} />
    <circle className="vault-radial__disc" r={SEG_OUT + 12} />
    <g className="vault-radial__turn" style={{ transform: `rotate(${turn}deg)` }}>
      {groups.map((item, index) => {
        const center = index * span;
        const selected = index === groupIndex;
        return <g key={item.id} className="vault-radial__segment" data-selected={selected || undefined} role="button" tabIndex={0} aria-label={item.label} aria-pressed={selected}
          onClick={() => setGroupIndex(index)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); setGroupIndex(index); } }}>
          <title>{item.label}</title>
          <path d={sector(center, span)} />
          {selected && <path d={sector(center, span)} fill={`url(#vault-radial-hatch-${uid})`} className="vault-radial__hatched" />}
          <foreignObject x={Number(polar((SEG_IN + SEG_OUT) / 2, center).split(' ')[0]) - 14} y={Number(polar((SEG_IN + SEG_OUT) / 2, center).split(' ')[1]) - 14} width="28" height="28">
            <span className="vault-radial__glyph" style={{ transform: `rotate(${-turn}deg)` }}>{item.icon}</span>
          </foreignObject>
        </g>;
      })}
    </g>
    <circle className="vault-radial__hub" r={96} />
    <g className="vault-radial__dial">
      {Array.from({ length: 72 }, (_, index) => {
        const deg = index * 5;
        const long = index % 6 === 0;
        return <line key={index} x1={polar(long ? 74 : 78, deg).split(' ')[0]} y1={polar(long ? 74 : 78, deg).split(' ')[1]} x2={polar(84, deg).split(' ')[0]} y2={polar(84, deg).split(' ')[1]} />;
      })}
      <line className="vault-radial__needle" x1={polar(68, facing).split(' ')[0]} y1={polar(68, facing).split(' ')[1]} x2={polar(86, facing).split(' ')[0]} y2={polar(86, facing).split(' ')[1]} />
    </g>
    <circle className="vault-radial__core" r={62} />
    <text className="vault-radial__name" y="4" textAnchor="middle">{group.label}</text>
  </svg>;

  const list = <ul className="vault-radial__items" role="listbox" aria-label={group.label} aria-activedescendant={items.length ? `vault-radial-${uid}-${focus}` : undefined}>
    {items.map((item, index) => {
      const distance = index - focus;
      const far = Math.abs(distance);
      if (far > 6) return null;
      const style: CSSProperties = compact
        ? { transform: `translate(-50%, calc(${distance * (ITEM_H + 8)}px - 50%))`, opacity: Math.max(0, 1 - far * 0.28), filter: far > 1 ? `blur(${(far - 1) * 0.8}px)` : undefined, zIndex: 10 - far }
        : { transform: `rotate(${distance * STEP}deg) translate(${REACH}px, -50%)`, opacity: Math.max(0, 1 - far * 0.2), filter: far > 1 ? `blur(${(far - 1) * 0.9}px)` : undefined, zIndex: 10 - far };
      return <li key={item.id} id={`vault-radial-${uid}-${index}`} role="option" aria-selected={distance === 0} aria-disabled={item.disabled || undefined} className="vault-radial__item" data-focused={distance === 0 || undefined} style={style}>
        <button type="button" tabIndex={-1} disabled={item.disabled} onClick={() => distance === 0 ? run(index) : setFocus(index)}>
          {item.icon && <span className="vault-radial__item-icon" aria-hidden="true">{item.icon}</span>}
          <span className="vault-radial__item-label">{item.label}</span>
          {item.hint && <span className="vault-radial__item-hint">{item.hint}</span>}
        </button>
      </li>;
    })}
  </ul>;

  const controls = <div className="vault-radial__controls" role="toolbar" aria-label="Điều khiển menu">
    <button type="button" className="vault-radial__control" aria-label="Đóng menu" title="Đóng" onClick={onClose}><RiCloseLine /></button>
    <button type="button" className="vault-radial__control" aria-label="Mục trước" title="Mục trước" disabled={focus <= 0} onClick={() => move(-1)}><RiArrowUpLine /></button>
    <button type="button" className="vault-radial__control" aria-label={`Chọn ${items.at(focus)?.label ?? ''}`} title="Chọn" disabled={!items.length || items.at(focus)?.disabled} onClick={() => run()}><RiStopFill /></button>
    <button type="button" className="vault-radial__control" aria-label="Mục sau" title="Mục sau" disabled={focus >= items.length - 1} onClick={() => move(1)}><RiArrowDownLine /></button>
  </div>;

  return <div className={`vault-radial${inline ? ' is-inline' : ''}${compact ? ' is-compact' : ''}`} data-theme-scope="dark"
    role={inline ? 'region' : 'dialog'} aria-modal={inline ? undefined : true} aria-label={label}
    ref={panel} tabIndex={-1} onKeyDown={onKeyDown} onWheel={onWheel}
    onMouseDown={event => { if (!inline && event.target === event.currentTarget) onClose(); }}>
    <div className="vault-radial__stage" style={compact ? undefined : { transform: `scale(${scale})` }}>
      <div className="vault-radial__dialwrap">{ring}</div>
      {!compact && <div className="vault-radial__link" aria-hidden="true"><i /><i /></div>}
      <div className="vault-radial__wheel">{list}</div>
    </div>
    {controls}
  </div>;
}
