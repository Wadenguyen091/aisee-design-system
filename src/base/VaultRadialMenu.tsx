import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode, type WheelEvent } from 'react';
import { RiCloseLine, RiLockLine } from '@remixicon/react';

export type VaultRadialItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Short trailing word, e.g. a state or a count. */
  hint?: string;
  disabled?: boolean;
  onSelect: () => void;
};

export type VaultRadialGroup = {
  id: string;
  label: string;
  icon: ReactNode;
  items: VaultRadialItem[];
};

type RadialStyle = CSSProperties & {
  '--vault-radial-angle': string;
  '--vault-radial-radius': string;
};

/**
 * Compact orbital launcher. The current group lives in the centre; its commands sit on one orbit.
 * Persistent labels and HUD decoration are deliberately removed: labels appear only as tooltips.
 * Keys: ↑ ↓ move between commands, ← → change group, Enter runs, Esc closes. The centre button
 * advances to the next group, so the component remains usable without a separate control rail.
 */
export function VaultRadialMenu({ open, onClose, groups, initialGroup, label = 'Menu', inline = false }: {
  open: boolean;
  onClose: () => void;
  groups: VaultRadialGroup[];
  initialGroup?: string;
  label?: string;
  inline?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);
  const wheelDelta = useRef(0);
  const startIndex = Math.max(0, groups.findIndex(group => group.id === initialGroup));
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [focusFor, setFocusFor] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) return;
    setGroupIndex(startIndex);
    if (inline) return;
    returnTo.current = document.activeElement as HTMLElement | null;
    window.requestAnimationFrame(() => panel.current?.focus());
    return () => returnTo.current?.focus?.();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const group = groups[Math.min(groupIndex, groups.length - 1)];
  if (!open || !group) return null;

  const items = group.items;
  const focus = Math.min(focusFor[group.id] ?? 0, Math.max(0, items.length - 1));
  const setFocus = (next: number) => setFocusFor(map => ({
    ...map,
    [group.id]: items.length ? (next + items.length) % items.length : 0,
  }));
  const move = (delta: number) => setFocus(focus + delta);
  const switchGroup = (delta: number) => setGroupIndex(index => (index + delta + groups.length) % groups.length);
  const run = (index = focus) => {
    const item = items[index];
    if (!item || item.disabled) return;
    onClose();
    item.onSelect();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowUp: () => move(-1),
      ArrowDown: () => move(1),
      ArrowLeft: () => switchGroup(-1),
      ArrowRight: () => switchGroup(1),
      Home: () => setFocus(0),
      End: () => setFocus(items.length - 1),
      Enter: () => run(),
      Escape: onClose,
    };
    const action = actions[event.key];
    if (!action) return;
    if (event.key === 'Enter' && (event.target as HTMLElement).closest('button')) return;
    event.preventDefault();
    action();
  };

  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    wheelDelta.current += event.deltaY;
    if (Math.abs(wheelDelta.current) < 48) return;
    move(wheelDelta.current > 0 ? 1 : -1);
    wheelDelta.current = 0;
  };

  return <div
    className={`vault-radial${inline ? ' is-inline' : ''}`}
    role={inline ? 'region' : 'dialog'}
    aria-modal={inline ? undefined : true}
    aria-label={label}
    ref={panel}
    tabIndex={-1}
    onKeyDown={onKeyDown}
    onWheel={onWheel}
    onMouseDown={event => { if (!inline && event.target === event.currentTarget) onClose(); }}
  >
    {!inline && <button className="vault-radial__close" type="button" aria-label="Đóng menu" onClick={onClose}><RiCloseLine /></button>}
    <div className="vault-radial__stage">
      <div className="vault-radial__orbit" aria-hidden="true" />
      <div className="vault-radial__hub" aria-hidden="true" />

      <div className="vault-radial__items" role="listbox" aria-label={group.label}>
        {items.map((item, index) => {
          // Seven commands use the compact 1–2–2–2 launcher layout: the
          // lower centre stays clear for the group switcher.
          const sevenItemAngles = [-90, -135, -45, 180, 0, 135, 45];
          const angle = items.length === 7 ? sevenItemAngles[index] : -90 + index * (360 / Math.max(items.length, 1));
          const active = index === focus;
          const radians = angle * Math.PI / 180;
          const labelSide = items.length === 7
            ? index === 0 ? 'top' : index % 2 === 1 ? 'left' : 'right'
            : Math.sin(radians) < -0.55 ? 'top'
              : Math.sin(radians) > 0.55 ? 'bottom'
                : Math.cos(radians) >= 0 ? 'right' : 'left';
          const style: RadialStyle = {
            '--vault-radial-angle': `${angle}deg`,
            '--vault-radial-radius': '88px',
          };
          return <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={active}
            aria-label={`${item.label}${item.hint ? `, ${item.hint}` : ''}`}
            disabled={item.disabled}
            className="vault-radial__item"
            data-active={active || undefined}
            data-label-side={labelSide}
            style={style}
            onPointerEnter={() => setFocus(index)}
            onFocus={() => setFocus(index)}
            onClick={() => active ? run(index) : setFocus(index)}
          >
            <span className="vault-radial__item-icon" aria-hidden="true">{item.disabled ? <RiLockLine /> : item.icon}</span>
            <span className="vault-radial__label">{item.label}{item.hint && <small>{item.hint}</small>}</span>
          </button>;
        })}
      </div>
      {groups.length > 1 && <button className="vault-radial__more" type="button" onClick={() => switchGroup(1)} aria-label={`Đổi nhóm. Hiện tại: ${group.label}`}>Thêm <span aria-hidden="true">•••</span></button>}
    </div>
  </div>;
}
