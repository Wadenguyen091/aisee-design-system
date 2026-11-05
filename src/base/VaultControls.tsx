import { useEffect, useRef, useState, type ButtonHTMLAttributes, type CSSProperties, type InputHTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import { publicAsset } from '../assets';
import {
  RiArrowDownSFill, RiArrowLeftSFill, RiArrowRightSFill, RiArrowRightSLine, RiCheckboxCircleFill, RiCheckFill, RiCloseFill, RiErrorWarningFill,
  RiInformationFill, RiMoreFill, RiSearchLine,
} from '@remixicon/react';

export type VaultControlPriority = 'primary' | 'secondary';
export type VaultControlTone = 'brand' | 'neutral' | 'danger' | 'semantic';
type LegacyVariant = 'primary' | 'secondary' | 'tertiary' | 'text';

export type VaultButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** @deprecated Prefer priority + tone. Kept while application controls migrate. */
  variant?: 'primary' | 'secondary' | 'tertiary';
  priority?: VaultControlPriority;
  tone?: VaultControlTone | 'default';
  appearance?: 'solid' | 'soft' | 'ghost' | 'text';
  /** sm = 32px, md = 40px. */
  size?: 'sm' | 'md';
  icon?: ReactNode;
  iconOnly?: boolean;
  loading?: boolean;
};

const controlVariant = (variant: LegacyVariant | undefined, priority: VaultControlPriority, appearance: 'solid' | 'soft' | 'ghost' | 'text'): LegacyVariant =>
  variant ?? (priority === 'primary' || appearance === 'solid' ? 'primary' : appearance === 'ghost' ? 'tertiary' : appearance === 'text' ? 'text' : 'secondary');

export function VaultButton({ variant, priority = 'secondary', tone = 'neutral', appearance = 'soft', size = 'md', icon, iconOnly = false, loading = false, className = '', children, disabled, ...props }: VaultButtonProps) {
  const resolvedPriority = variant === 'primary' ? 'primary' : priority;
  const resolvedAppearance = resolvedPriority === 'primary' ? 'solid' : appearance;
  const legacyAppearance = controlVariant(variant, resolvedPriority, resolvedAppearance);
  const resolvedTone = tone === 'default' ? (resolvedPriority === 'primary' ? 'brand' : 'neutral') : tone;
  return <button
    {...props}
    disabled={disabled || loading}
    aria-busy={loading || undefined}
    data-loading={loading || undefined}
    data-size={size}
    data-tone={resolvedTone}
    data-priority={resolvedPriority}
    data-appearance={resolvedAppearance}
    data-kind={iconOnly ? 'icon' : 'text'}
    className={`vault-button vault-button--${legacyAppearance} ${iconOnly ? 'is-icon-only' : ''} ${className}`.trim()}
  >{loading && <span className="vault-button__spinner vault-spinner" aria-hidden="true" />}{!loading && icon}{children}</button>;
}

export function VaultToggle<T extends string>({ value, options, onChange, label, columns }: {
  value: T;
  options: Array<{ value: T; label: ReactNode; disabled?: boolean }>;
  onChange: (value: T) => void;
  label: string;
  /** Lay options out as a grid with this many columns instead of a single pill row. */
  columns?: number;
}) {
  return <div className="vault-toggle" role="group" aria-label={label} data-columns={columns || undefined} style={columns ? { '--vault-toggle-columns': columns } as CSSProperties : undefined}>
    {options.map(option => <button key={option.value} type="button" disabled={option.disabled} aria-pressed={value === option.value} data-state={value === option.value ? 'selected' : 'default'} onClick={() => onChange(option.value)}>{option.label}</button>)}
  </div>;
}

export function VaultDropdownTrigger({ variant, priority = 'secondary', tone = 'neutral', appearance = 'soft', label, ariaLabel, icon, expanded, selected = false, disabled = false, className = '', onClick }: {
  variant?: 'primary' | 'secondary' | 'tertiary';
  priority?: VaultControlPriority;
  tone?: VaultControlTone;
  appearance?: 'solid' | 'soft' | 'ghost';
  label: string;
  ariaLabel?: string;
  icon?: ReactNode;
  expanded?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}) {
  const resolvedPriority = variant === 'primary' ? 'primary' : priority;
  const resolvedAppearance = resolvedPriority === 'primary' ? 'solid' : appearance;
  const legacyAppearance = controlVariant(variant, resolvedPriority, resolvedAppearance);
  return <button type="button" className={`vault-dropdown-trigger vault-dropdown-trigger--${legacyAppearance} ${icon ? 'has-icon' : ''} ${className}`.trim()} aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={expanded} data-state={expanded ? 'expanded' : selected ? 'selected' : 'closed'} data-selected={selected || undefined} data-priority={resolvedPriority} data-tone={tone} data-appearance={resolvedAppearance} disabled={disabled} onClick={onClick}>
    {icon}<span className="vault-dropdown-trigger__label">{label}</span><RiArrowDownSFill className="vault-dropdown-chevron" size={14} aria-hidden />
  </button>;
}

export function VaultDropdownField({ label, value, children, ...triggerProps }: Omit<Parameters<typeof VaultDropdownTrigger>[0], 'label' | 'ariaLabel'> & {
  label: string;
  value: string;
  /** The open VaultDropdownMenu: it floats under the trigger at the field's width. */
  children?: ReactNode;
}) {
  return <div className="vault-dropdown-field">
    <VaultDropdownTrigger {...triggerProps} label={value} ariaLabel={label} />
    {children}
  </div>;
}

export function VaultDropdownMenu<T extends string>({ value, items, onChange, label }: {
  value: T;
  items: Array<{ value: T; label: ReactNode; icon?: ReactNode; badge?: string | number; disabled?: boolean }>;
  onChange: (value: T) => void;
  label: string;
}) {
  return <div className="vault-dropdown-menu" role="listbox" aria-label={label}>
    {items.map(item => <button
      key={item.value}
      type="button"
      role="option"
      aria-selected={value === item.value}
      disabled={item.disabled}
      onClick={() => onChange(item.value)}
    >
      <span className="vault-dropdown-menu__icon" aria-hidden="true">{item.icon}</span>
      <span className="vault-dropdown-menu__label">{item.label}</span>
      {item.badge !== undefined && <VaultBadge tone="category">{item.badge}</VaultBadge>}
      {value === item.value && item.badge === undefined && <RiCheckFill className="vault-dropdown-menu__check" aria-hidden="true" />}
    </button>)}
  </div>;
}

export function VaultField({ label, showLabel = false, hint, error, icon, loading = false, className = '', id, disabled, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  /** Show the label above the control (forms). Default keeps it as an accessible name only. */
  showLabel?: boolean;
  hint?: string;
  error?: string;
  icon?: ReactNode;
  loading?: boolean;
}) {
  const fieldId = id || `vault-field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const messageId = `${fieldId}-message`;
  return <label className={`vault-field ${error ? 'is-invalid' : ''} ${className}`.trim()} htmlFor={fieldId} aria-busy={loading || undefined} data-loading={loading || undefined} data-labelled={showLabel || undefined}>
    {showLabel && <span className="vault-field__label">{label}</span>}
    <span className="vault-field__control">{icon}<input {...props} id={fieldId} aria-label={props['aria-label'] || label} disabled={disabled || loading} aria-invalid={error ? true : undefined} aria-describedby={hint || error ? messageId : undefined} />{loading && <span className="vault-field__spinner vault-spinner" aria-hidden="true" />}</span>
    {(error || hint) && <small id={messageId} className="vault-field__message">{error || hint}</small>}
  </label>;
}

export function VaultSearch({ label, loading = false, onClear, className = '', disabled, value, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  loading?: boolean;
  onClear?: () => void;
}) {
  const hasValue = value !== undefined && value !== null && String(value).length > 0;
  return <label className={`vault-search-control ${className}`.trim()} data-loading={loading || undefined}>
    <RiSearchLine aria-hidden="true" />
    <input {...props} type="search" value={value} disabled={disabled || loading} aria-label={props['aria-label'] || label} />
    {loading
      ? <span className="vault-search-control__spinner vault-spinner" aria-hidden="true" />
      : hasValue && onClear
        ? <button type="button" onClick={onClear} aria-label={`Xóa ${label}`}><RiCloseFill aria-hidden="true" /></button>
        : null}
  </label>;
}

export function VaultBadge({ children, tone = 'category', className = '' }: {
  children: ReactNode;
  /** `ink` sits on any coloured surface: a 14% tint of the current text colour, no border. */
  tone?: 'info' | 'success' | 'warning' | 'danger' | 'category' | 'ink';
  className?: string;
}) {
  return <span className={`vault-badge vault-badge--${tone} ${className}`.trim()} data-ui="badge" data-tone={tone}>{children}</span>;
}

/** The system avatar every person gets until they upload their own photo. */
export const VAULT_SYSTEM_AVATAR = publicAsset('/default-user-avatar.png');

export function VaultAvatar({ name, src, size = 'md', status, subscription = false, fallback = 'system', className = '' }: {
  name: string;
  src?: string;
  /** What to show without `src`: the system avatar (people, default) or initials (organisations, broken images). */
  fallback?: 'system' | 'initials';
  size?: 'sm' | 'md' | 'lg';
  status?: 'online' | 'away' | 'offline';
  subscription?: boolean;
  className?: string;
}) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  const [broken, setBroken] = useState<string | null>(null);
  const image = src || (fallback === 'system' ? VAULT_SYSTEM_AVATAR : '');
  return <span className={`vault-avatar ${subscription ? 'is-subscriber' : ''} ${className}`.trim()} data-size={size} aria-label={name}>
    {image && broken !== image ? <img src={image} alt="" loading="lazy" onError={() => setBroken(image)} /> : <span aria-hidden="true">{initials}</span>}
    {status && <i data-status={status} aria-label={status} />}
  </span>;
}

export function VaultSwitch({ checked, onChange, label, disabled = false, hideLabel = false }: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  /** Keep the label for assistive tech only (table/list columns), like VaultCheckbox. */
  hideLabel?: boolean;
}) {
  return <span className="vault-toggle-field" data-hide-label={hideLabel || undefined}>
    <strong>{label}</strong>
    <button type="button" role="switch" aria-label={label} aria-checked={checked} disabled={disabled} className="vault-switch" onClick={() => onChange(!checked)}>
      <span aria-hidden="true" />
    </button>
  </span>;
}

export function VaultCheckbox({ checked, indeterminate = false, onChange, label, disabled = false, hideLabel = false }: {
  checked: boolean;
  /** Keep the label for assistive tech only (table/list selection columns). */
  hideLabel?: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return <label className="vault-checkbox" data-state={indeterminate ? 'indeterminate' : checked ? 'checked' : 'unchecked'} data-disabled={disabled || undefined}>
    <input type="checkbox" checked={checked} disabled={disabled} aria-checked={indeterminate ? 'mixed' : checked} onChange={event => onChange(event.target.checked)} />
    <span aria-hidden="true">{indeterminate ? <i /> : checked ? <RiCheckFill /> : null}</span>
    <strong className={hideLabel ? 'sr-only' : undefined}>{label}</strong>
  </label>;
}

export function VaultTooltip({ label, children, placement = 'top' }: { label: string; children: ReactNode; placement?: 'top' | 'bottom' }) {
  return <span className="vault-tooltip" data-placement={placement}>
    {children}<span role="tooltip">{label}</span>
  </span>;
}

export function VaultBreadcrumb({ items, label = 'Breadcrumb' }: {
  items: Array<{ label: string; href?: string; icon?: ReactNode; onClick?: () => void }>;
  label?: string;
}) {
  return <nav className="vault-breadcrumb" aria-label={label}><ol>{items.map((item, index) => {
    const current = index === items.length - 1;
    return <li key={`${item.label}-${index}`}>{index > 0 && <RiArrowRightSLine aria-hidden="true" />}{current
      ? <span aria-current="page">{item.icon}{item.label}</span>
      : <a href={item.href || '#'} onClick={item.onClick ? event => { event.preventDefault(); item.onClick?.(); } : undefined}>{item.icon}{item.label}</a>}</li>;
  })}</ol></nav>;
}

export function VaultPagination({ page, total, onChange, label = 'Phân trang' }: {
  page: number;
  total: number;
  onChange: (page: number) => void;
  label?: string;
}) {
  const safeTotal = Math.max(1, total);
  const visible = Array.from(new Set([1, Math.max(1, page - 1), page, Math.min(safeTotal, page + 1), safeTotal])).sort((a, b) => a - b);
  return <nav className="vault-pagination" aria-label={label}>
    <VaultButton appearance="ghost" iconOnly size="sm" icon={<RiArrowLeftSFill />} aria-label="Trang trước" disabled={page <= 1} onClick={() => onChange(page - 1)} />
    {visible.map((value, index) => <span key={value}>{index > 0 && value - visible[index - 1] > 1 && <i aria-hidden="true"><RiMoreFill /></i>}<VaultButton appearance="ghost" size="sm" aria-current={value === page ? 'page' : undefined} onClick={() => onChange(value)}>{value}</VaultButton></span>)}
    <VaultButton appearance="ghost" iconOnly size="sm" icon={<RiArrowRightSFill />} aria-label="Trang sau" disabled={page >= safeTotal} onClick={() => onChange(page + 1)} />
  </nav>;
}

export function VaultDashboardNav<T extends string>({ value, items, onChange, label = 'Dashboard navigation' }: {
  value: T;
  items: Array<{ value: T; label: string; icon: ReactNode; badge?: string; disabled?: boolean }>;
  onChange: (value: T) => void;
  label?: string;
}) {
  return <nav className="vault-dashboard-nav" aria-label={label}>{items.map(item => <button key={item.value} type="button" aria-current={value === item.value ? 'page' : undefined} disabled={item.disabled} onClick={() => onChange(item.value)}>{item.icon}<span>{item.label}</span>{item.badge && <VaultBadge tone="category">{item.badge}</VaultBadge>}</button>)}</nav>;
}

export function VaultNotice({ mode = 'toast', tone = 'info', title, description, action, onAction, onClose, className = '' }: {
  mode?: 'toast' | 'alert';
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  description?: string;
  action?: string;
  onAction?: () => void;
  onClose?: () => void;
  className?: string;
}) {
  const Icon = tone === 'success' ? RiCheckboxCircleFill : tone === 'info' ? RiInformationFill : RiErrorWarningFill;
  return <div className={`vault-notice is-toast is-${tone} ${className}`.trim()} data-legacy-mode={mode} role={tone === 'danger' ? 'alert' : 'status'}>
    <span className="vault-notice__icon"><Icon aria-hidden="true" /></span>
    <span className="vault-notice__body">
      <span className="vault-notice__copy"><span className="vault-notice__heading"><strong>{title}</strong></span>{description && <small>{description}</small>}</span>
      {action && <VaultButton type="button" appearance="ghost" size="sm" className="vault-notice__action" onClick={onAction}>{action}</VaultButton>}
      {onClose && <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiCloseFill aria-hidden="true" />} className="vault-notice__close vault-close" onClick={onClose} aria-label="Đóng" />}
    </span>
  </div>;
}

export type VaultButtonGroupProps<T extends string> = {
  value: T;
  options: Array<{ value: T; label: ReactNode; icon?: ReactNode; badge?: string | number; disabled?: boolean }>;
  onChange: (value: T) => void;
  label: string;
  semantics?: 'selection' | 'tabs';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary';
};

export function VaultButtonGroup<T extends string>({ value, options, onChange, label, semantics = 'selection', size = 'md', fullWidth = false, variant = 'secondary' }: VaultButtonGroupProps<T>) {
  const isTabs = semantics === 'tabs';
  const selectedIndex = options.findIndex(option => option.value === value && !option.disabled);
  const firstEnabledIndex = options.findIndex(option => !option.disabled);
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : firstEnabledIndex;
  const groupRef = useRef<HTMLDivElement>(null);
  // When the group scrolls (narrow container), keep the selected option in view without moving the page.
  useEffect(() => {
    const group = groupRef.current;
    const selected = group?.querySelector<HTMLElement>(':scope > [data-state="selected"]');
    if (!group || !selected || group.scrollWidth <= group.clientWidth) return;
    const left = selected.offsetLeft - group.offsetLeft;
    if (left < group.scrollLeft || left + selected.offsetWidth > group.scrollLeft + group.clientWidth) group.scrollLeft = Math.max(0, left - 8);
  }, [value]);
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const enabledIndexes = options.map((option, optionIndex) => option.disabled ? -1 : optionIndex).filter(optionIndex => optionIndex >= 0);
    if (!enabledIndexes.length) return;
    const position = enabledIndexes.indexOf(index);
    const nextIndex = event.key === 'Home' ? enabledIndexes[0]
      : event.key === 'End' ? enabledIndexes[enabledIndexes.length - 1]
        : event.key === 'ArrowRight' ? enabledIndexes[(position + 1 + enabledIndexes.length) % enabledIndexes.length]
          : enabledIndexes[(position - 1 + enabledIndexes.length) % enabledIndexes.length];
    onChange(options[nextIndex].value);
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(':scope > button');
    window.requestAnimationFrame(() => buttons?.[nextIndex]?.focus());
  };
  return <div ref={groupRef} className="vault-button-group" role={isTabs ? 'tablist' : 'group'} aria-label={label} data-size={size} data-variant={variant} data-full-width={fullWidth || undefined} style={{ '--vault-segment-count': options.length } as CSSProperties}>
    {options.map((option, index) => {
      const selected = value === option.value;
      return <VaultButton
        key={option.value}
        type="button"
        size={size}
        appearance="ghost"
        icon={option.icon}
        role={isTabs ? 'tab' : undefined}
        aria-selected={isTabs ? selected : undefined}
        aria-pressed={isTabs ? undefined : selected}
        data-state={selected ? 'selected' : 'default'}
        data-icon-only={!option.label || undefined}
        tabIndex={option.disabled ? -1 : index === tabStopIndex ? 0 : -1}
        disabled={option.disabled}
        onClick={() => { if (!selected) onChange(option.value); }}
        onKeyDown={event => handleKeyDown(event, index)}
      >{option.label}{option.badge !== undefined && <span className="vault-button-group__badge" aria-label={`${option.badge}`}>{option.badge}</span>}</VaultButton>;
    })}
  </div>;
}

export type VaultTabsProps<T extends string> = {
  value: T;
  options: Array<{ value: T; label: ReactNode; icon?: ReactNode; badge?: string | number; disabled?: boolean; className?: string }>;
  onChange: (value: T) => void;
  label: string;
};

export function VaultTabs<T extends string>({ value, options, onChange, label }: VaultTabsProps<T>) {
  return <div className="vault-tabs" role="tablist" aria-label={label}>
    {options.map(option => {
      const selected = value === option.value;
      return <button
        key={option.value}
        type="button"
        role="tab"
        aria-selected={selected}
        data-state={selected ? 'selected' : 'default'}
        disabled={option.disabled}
        className={option.className || ''}
        onClick={() => onChange(option.value)}
      >{option.icon}<span>{option.label}</span>{option.badge !== undefined && <b className="vault-tab-badge" aria-hidden="true">{option.badge}</b>}</button>;
    })}
  </div>;
}

/**
 * Segmented progress, 20 segments × 5%.
 * - `value` 0–100 → determinate; 100 turns the bar success-coloured.
 * - `loading` (or no value) → indeterminate: a short highlight travels across the segments.
 */
export function VaultProgress({ value, label, loading = false, className = '' }: { value?: number; label: string; loading?: boolean; className?: string }) {
  const indeterminate = loading || value === undefined;
  const normalized = Math.max(0, Math.min(100, value ?? 0));
  const activeSegments = indeterminate ? 0 : Math.round(normalized / 5);
  return <div
    className={`vault-progress ${className}`.trim()}
    role="progressbar"
    aria-label={label}
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={indeterminate ? undefined : normalized}
    aria-busy={indeterminate || undefined}
    data-state={indeterminate ? 'loading' : normalized >= 100 ? 'complete' : undefined}
  >
    <span aria-hidden="true">{Array.from({ length: 20 }, (_, index) => <i key={index} style={{ '--vault-progress-i': index } as CSSProperties} data-active={index < activeSegments || undefined} />)}</span>
  </div>;
}
