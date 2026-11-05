import { useEffect, useId, useRef, type CSSProperties, type HTMLAttributes, type KeyboardEvent, type ReactNode, type Ref } from 'react';
import { RiCheckFill, RiCloseFill } from '@remixicon/react';
import { VaultButton } from './VaultControls';
import { VaultKbd } from './VaultContent';
import { useDialogBehavior } from './useDialogBehavior';

/* ------------------------------------------------------------------ Dialog */

export type VaultDialogProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** sm 384 · md 480 · lg 640 */
  size?: 'sm' | 'md' | 'lg';
  /** Close when the scrim is clicked. Leave off for forms so a stray click never discards input. */
  dismissOnBackdrop?: boolean;
  /** Render in place without modal behaviour (Design System specimens). */
  inline?: boolean;
  /** danger tints the header icon cell for destructive confirmations. */
  tone?: 'default' | 'danger';
  /** Header alignment. `start` (default) for feature/form popups; `center` for confirmations. Danger defaults to center. */
  align?: 'start' | 'center';
  className?: string;
};

/**
 * Modal dialog. Header (icon · title · close), body, optional footer.
 * Esc closes, focus stays inside while open and returns to the opener on close.
 */
export function VaultDialog({ open, onClose, title, description, icon, children, footer, size = 'md', dismissOnBackdrop = false, inline = false, tone = 'default', align, className = '' }: VaultDialogProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogBehavior(panelRef, open && !inline, onClose);
  if (!open) return null;
  return <div
    className="vault-dialog__backdrop"
    data-inline={inline || undefined}
    onMouseDown={dismissOnBackdrop ? (event) => { if (event.target === event.currentTarget) onClose(); } : undefined}
  >
    <section
      ref={panelRef}
      onKeyDown={(event) => { if (event.key !== 'Escape') event.stopPropagation(); }}
      className={`vault-dialog ${className}`.trim()}
      data-size={size}
      data-tone={tone === 'default' ? undefined : tone}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* 3 blocks: hero header (icon circle, title, description on a top-down gradient), full-bleed body, action footer. */}
      <header className="vault-dialog__header" data-layout="hero" data-align={align ?? (tone === 'danger' ? 'center' : 'start')} data-has-icon={icon ? true : undefined}>
        {icon && <span className="vault-dialog__icon" aria-hidden="true">{icon}</span>}
        <div className="vault-dialog__heading">
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
        <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiCloseFill aria-hidden="true" />} aria-label="Đóng" data-dialog-close className="vault-close" onClick={onClose} />
      </header>
      {children}
      {footer && <footer className="vault-dialog__footer">{footer}</footer>}
    </section>
  </div>;
}

/** Dialog body. `flush` removes padding so full-bleed rows (menus, lists) touch the edges. */
export function VaultDialogBody({ children, flush = false, className = '' }: { children: ReactNode; flush?: boolean; className?: string }) {
  return <div className={`vault-dialog__body ${className}`.trim()} data-flush={flush || undefined}>{children}</div>;
}

/* ------------------------------------------------------------------- Sheet */

export type VaultSheetProps = {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  /** Optional row under the header, e.g. VaultTabs. Sits full-bleed with a hairline below. */
  toolbar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** sm 360 · md 400 · lg 560 · xl 1040 (a whole tool view: tables, dashboards) */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dismissOnBackdrop?: boolean;
  /** Render inside the nearest positioned parent instead of the viewport (specimens, split views). */
  inline?: boolean;
  tone?: 'default' | 'danger';
  className?: string;
};

/**
 * Side sheet that slides in from the right edge. Same header anatomy as VaultDialog
 * (64px row: tinted icon cell, title, quiet close) and the same modal behaviour:
 * Esc closes, focus is trapped and returned to the opener.
 */
export function VaultSheet({ open, onClose, title, description, icon, toolbar, children, footer, size = 'md', dismissOnBackdrop = true, inline = false, tone = 'default', className = '' }: VaultSheetProps) {
  const panelRef = useRef<HTMLElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  useDialogBehavior(panelRef, open && !inline, onClose);
  if (!open) return null;
  return <div
    className="vault-sheet__backdrop"
    data-inline={inline || undefined}
    onMouseDown={dismissOnBackdrop ? (event) => { if (event.target === event.currentTarget) onClose(); } : undefined}
  >
    <section
      ref={panelRef}
      onKeyDown={(event) => { if (event.key !== 'Escape') event.stopPropagation(); }}
      className={`vault-sheet ${className}`.trim()}
      data-size={size}
      data-tone={tone === 'default' ? undefined : tone}
      role="dialog"
      aria-modal={inline ? undefined : true}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
    >
      <header className="vault-dialog__header" data-has-icon={icon ? true : undefined}>
        {icon && <span className="vault-dialog__icon" aria-hidden="true">{icon}</span>}
        <div className="vault-dialog__heading">
          <h2 id={titleId}>{title}</h2>
          {description && <p id={descriptionId}>{description}</p>}
        </div>
        <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiCloseFill aria-hidden="true" />} aria-label="Đóng" data-dialog-close className="vault-close" onClick={onClose} />
      </header>
      {toolbar && <div className="vault-sheet__toolbar">{toolbar}</div>}
      <div className="vault-sheet__body">{children}</div>
      {footer && <footer className="vault-dialog__footer">{footer}</footer>}
    </section>
  </div>;
}

/* ----------------------------------------------------------------- Popover */

export type VaultPopoverProps = {
  open: boolean;
  onClose: () => void;
  trigger: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Accessible name when there is no visible title. */
  label?: string;
  /** top-* opens above the trigger (triggers docked at the bottom, e.g. a prompt footer). */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  /** Panel width in px; keep it a multiple of 4. */
  width?: number;
  className?: string;
};

/** Non-modal panel anchored to its trigger. Closes on outside click and Esc. */
export function VaultPopover({ open, onClose, trigger, title, description, children, footer, label, placement = 'bottom-end', width = 320, className = '' }: VaultPopoverProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) closeRef.current(); };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing) return;
      // Only claim Escape when focus is in this popover (or nowhere): never steal it from another field.
      const target = event.target as Node | null;
      if (target && target !== document.body && !rootRef.current?.contains(target)) return;
      event.stopPropagation();
      closeRef.current();
      rootRef.current?.querySelector<HTMLElement>('[aria-expanded]')?.focus();
    };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', escape, true);
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', escape, true); };
  }, [open]);

  return <div ref={rootRef} className={`vault-popover ${className}`.trim()}>
    {trigger}
    {open && <section onKeyDown={(event) => { if (event.key !== 'Escape') event.stopPropagation(); }} className="vault-popover__panel" data-placement={placement} role="dialog" aria-label={title ? undefined : label} aria-labelledby={title ? titleId : undefined} style={{ width } as CSSProperties}>
      {title && <header className="vault-popover__header">
        <div><strong id={titleId}>{title}</strong>{description && <span>{description}</span>}</div>
        <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiCloseFill aria-hidden="true" />} aria-label="Đóng" className="vault-close" onClick={onClose} />
      </header>}
      {children}
      {footer && <footer className="vault-popover__footer">{footer}</footer>}
    </section>}
  </div>;
}

/** Full-bleed section inside a popover, with an optional caption label. */
export function VaultPopoverSection({ label, children }: { label?: ReactNode; children: ReactNode }) {
  return <div className="vault-popover__section">{label && <span className="vault-popover__label">{label}</span>}{children}</div>;
}

/* -------------------------------------------------------------------- Menu */

const MENU_ITEMS = '[role="menuitem"]:not(:disabled),[role="menuitemradio"]:not(:disabled),[role="menuitemcheckbox"]:not(:disabled)';

export type VaultMenuProps = Omit<HTMLAttributes<HTMLDivElement>, 'role' | 'children' | 'onKeyDown'> & {
  label: string;
  children: ReactNode;
  /** Called on Esc, Tab and outside click. Omit for menus embedded in another surface. */
  onClose?: () => void;
  /** @deprecated Every menu row is 40px (design decision). 'compact' is kept only so old call sites compile. */
  density?: 'comfortable' | 'compact';
  /** Move focus to the first item on mount (keyboard-opened menus). */
  autoFocus?: boolean;
  className?: string;
  style?: CSSProperties;
  menuRef?: Ref<HTMLDivElement>;
  /** Extra attributes (data-*, event handlers) pass through to the menu element. */
  [dataAttribute: `data-${string}`]: string | boolean | undefined;
};

/** Action menu with full-bleed rows. Arrow keys, Home/End move between items. */
export function VaultMenu({ label, children, onClose, density = 'comfortable', autoFocus = false, className = '', style, menuRef, ...rest }: VaultMenuProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const floating = Boolean(onClose);

  // Floating menus (context menus) take focus when they open so arrows and Esc work
  // even when they were opened with the mouse. Embedded menus leave focus alone.
  useEffect(() => {
    if (autoFocus) { innerRef.current?.querySelector<HTMLElement>(MENU_ITEMS)?.focus(); return; }
    if (floating) innerRef.current?.focus({ preventScroll: true });
  }, [autoFocus, floating]);

  useEffect(() => {
    if (!floating) return;
    const outside = (event: PointerEvent) => { if (!innerRef.current?.contains(event.target as Node)) closeRef.current?.(); };
    const escape = (event: globalThis.KeyboardEvent) => { const target = event.target as Node | null; if (event.key === 'Escape' && !event.isComposing && (!target || target === document.body || innerRef.current?.contains(target))) { event.stopPropagation(); closeRef.current?.(); } };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', escape, true);
    return () => { document.removeEventListener('pointerdown', outside, true); document.removeEventListener('keydown', escape, true); };
  }, [floating]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    // Keys never leak to page shortcuts (e.g. Backspace deleting canvas items) while a menu has focus.
    if (event.key !== 'Escape') event.stopPropagation();
    // Text fields inside a menu (inline rename) keep their own editing keys.
    if ((event.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return;
    if (event.key === 'Escape' || event.key === 'Tab') {
      if (closeRef.current) { if (event.key === 'Escape') event.preventDefault(); event.stopPropagation(); closeRef.current(); }
      return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = [...(innerRef.current?.querySelectorAll<HTMLElement>(MENU_ITEMS) ?? [])];
    if (!items.length) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'Home' ? 0
      : event.key === 'End' ? items.length - 1
        : event.key === 'ArrowDown' ? (index + 1) % items.length
          : index < 0 ? items.length - 1 : (index - 1 + items.length) % items.length;
    items[next].focus();
  };

  return <div
    {...rest}
    ref={(node) => {
      innerRef.current = node;
      if (typeof menuRef === 'function') menuRef(node);
      else if (menuRef) (menuRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }}
    role="menu"
    aria-label={label}
    tabIndex={floating ? -1 : undefined}
    className={`vault-menu ${className}`.trim()}
    data-density={density}
    style={style}
    onKeyDown={onKeyDown}
  >{children}</div>;
}

export type VaultMenuItemProps = {
  children: ReactNode;
  icon?: ReactNode;
  /** Keyboard shortcut shown at the end of the row. */
  shortcut?: string;
  /** Secondary text shown at the end of the row (e.g. "Hiện tại"). */
  hint?: ReactNode;
  tone?: 'neutral' | 'danger';
  /** Defined → the row becomes a radio item. */
  checked?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
  className?: string;
};

export function VaultMenuItem({ children, icon, shortcut, hint, tone = 'neutral', checked, disabled = false, onSelect, className = '' }: VaultMenuItemProps) {
  const isRadio = checked !== undefined;
  return <button
    type="button"
    role={isRadio ? 'menuitemradio' : 'menuitem'}
    aria-checked={isRadio ? checked : undefined}
    disabled={disabled}
    data-tone={tone}
    className={`vault-menu__item ${className}`.trim()}
    onClick={onSelect}
  >
    <span className="vault-menu__icon" aria-hidden="true">{icon}</span>
    <span className="vault-menu__label">{children}</span>
    {hint && <span className="vault-menu__hint">{hint}</span>}
    {shortcut && <VaultKbd>{shortcut}</VaultKbd>}
    {isRadio && checked && <RiCheckFill className="vault-menu__check" aria-hidden="true" />}
  </button>;
}

export function VaultMenuSeparator() {
  return <div role="separator" className="vault-menu__separator" />;
}

/** Labelled group of rows; the label is a caption row, not an item. */
export function VaultMenuGroup({ label, showLabel = false, children }: { label: string; showLabel?: boolean; children: ReactNode }) {
  return <div role="group" aria-label={label} className="vault-menu__group">
    {showLabel && <span className="vault-menu__caption" aria-hidden="true">{label}</span>}
    {children}
  </div>;
}
