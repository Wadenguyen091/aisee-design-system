import { useId, type CSSProperties, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react';

/** Keyboard key or shortcut, e.g. <VaultKbd>⌘ K</VaultKbd>. 20px tall. */
export function VaultKbd({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <kbd className={`vault-kbd ${className}`.trim()}>{children}</kbd>;
}

/** Multi-line field with the same label / hint / error contract as VaultField. */
export function VaultTextarea({ label, showLabel = true, hint, error, mono = false, className = '', id, rows = 4, ref, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  /** The textarea element (focus, selection). */
  ref?: Ref<HTMLTextAreaElement>;
  label: string;
  showLabel?: boolean;
  hint?: string;
  error?: string;
  /** Monospace for code. */
  mono?: boolean;
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const messageId = `${fieldId}-message`;
  return <label className={`vault-field vault-textarea ${error ? 'is-invalid' : ''} ${className}`.trim()} htmlFor={fieldId} data-labelled={showLabel || undefined}>
    {showLabel && <span className="vault-field__label">{label}</span>}
    <textarea
      {...props}
      ref={ref}
      id={fieldId}
      rows={rows}
      data-mono={mono || undefined}
      aria-label={showLabel ? undefined : label}
      aria-invalid={error ? true : undefined}
      aria-describedby={hint || error ? messageId : undefined}
    />
    {(error || hint) && <small id={messageId} className="vault-field__message">{error || hint}</small>}
  </label>;
}

/** Visible label + any control (swatches, segmented choices) laid out like a field. */
export function VaultFormRow({ label, hint, children, className = '' }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  const labelId = useId();
  return <div className={`vault-form-row ${className}`.trim()} role="group" aria-labelledby={labelId}>
    <span id={labelId} className="vault-field__label">{label}</span>
    {children}
    {hint && <small className="vault-field__message">{hint}</small>}
  </div>;
}

/** Loading placeholder. Sizes in px should be multiples of 4. */
export function VaultSkeleton({ width = '100%', height = 16, shape = 'rect', lines, className = '' }: {
  width?: number | string;
  height?: number;
  shape?: 'rect' | 'circle' | 'text';
  /** Render n text lines; the last one is shorter. */
  lines?: number;
  className?: string;
}) {
  if (lines && lines > 1) {
    return <span className={`vault-skeleton-lines ${className}`.trim()} aria-hidden="true">
      {Array.from({ length: lines }, (_, index) => <span key={index} className="vault-skeleton" data-shape="text" style={{ width: index === lines - 1 ? '64%' : '100%' } as CSSProperties} />)}
    </span>;
  }
  return <span className={`vault-skeleton ${className}`.trim()} data-shape={shape} aria-hidden="true" style={{ width, height } as CSSProperties} />;
}

/** Pick one colour from a row of swatches (radio semantics). */
export function VaultSwatchPicker<T extends string>({ value, options, onChange, label, columns }: {
  value: T;
  options: Array<{ value: T; label: string; color: string }>;
  onChange: (value: T) => void;
  label: string;
  columns?: number;
}) {
  return <div className="vault-swatch-picker" role="radiogroup" aria-label={label} style={{ '--vault-swatch-columns': columns ?? options.length } as CSSProperties}>
    {options.map(option => <button
      key={option.value}
      type="button"
      role="radio"
      aria-checked={value === option.value}
      aria-label={option.label}
      title={option.label}
      onClick={() => onChange(option.value)}
      style={{ '--vault-swatch': option.color } as CSSProperties}
    ><i aria-hidden="true">{value === option.value && <svg viewBox="0 0 24 24"><path d="M10 15.17 19.19 5.98l1.41 1.41L10 18 3.64 11.64l1.41-1.41z" /></svg>}</i></button>)}
  </div>;
}

/** Full-bleed term → detail rows (shortcuts, properties, metadata). */
export function VaultDescriptionList({ items, className = '' }: {
  items: Array<{ term: ReactNode; detail: ReactNode; icon?: ReactNode; key?: string }>;
  className?: string;
}) {
  return <dl className={`vault-description-list ${className}`.trim()}>
    {items.map((item, index) => <div key={item.key ?? index} className="vault-description-list__row">
      <dt>{item.icon && <span className="vault-description-list__icon" aria-hidden="true">{item.icon}</span>}<span>{item.term}</span></dt>
      <dd>{item.detail}</dd>
    </div>)}
  </dl>;
}

export type VaultEmptyArt = 'projects' | 'search' | 'inbox';

/** Hairline illustrations: 1px non-scaling strokes on a 160×120 grid, muted ink, one brand accent. */
function EmptyArt({ art }: { art: VaultEmptyArt }) {
  const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' as const, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const solid = { ...line, fill: 'var(--ds-color-surface)' };
  const accent = { ...line, stroke: 'var(--ds-color-action)' };
  return <svg className="vault-empty__art" viewBox="0 0 160 120" width="160" height="120" aria-hidden="true" focusable="false">
    <path {...line} strokeDasharray="2 4" d="M12 104H148" />
    {art === 'projects' && <>
      <path {...solid} d="M36 36h28l8 8h52v60H36z" />
      <rect {...solid} x="48" y="24" width="52" height="40" />
      <path {...line} d="M56 36h28M56 44h20" />
      <path {...solid} d="M32 60h96l-8 44H40z" />
      <path {...line} d="M72 80h16" />
    </>}
    {art === 'search' && <>
      <rect {...solid} x="32" y="20" width="72" height="84" />
      <path {...line} d="M44 36h48M44 48h32M44 60h40" />
      <circle {...solid} cx="96" cy="68" r="20" />
      <path {...line} d="M110 82l20 20" />
      <path {...line} d="M88 68h16" />
    </>}
    {art === 'inbox' && <>
      <path {...solid} d="M28 64l16-36h72l16 36v40H28z" />
      <path {...line} d="M28 64h32l4 12h32l4-12h32" />
      <path {...line} d="M60 44h40M64 52h32" />
    </>}
    <path {...accent} d="M132 20v12M126 26h12" />
    <circle {...accent} cx="24" cy="40" r="2" />
  </svg>;
}

/** Empty state: hairline art, title, one line of guidance and an optional action. */
export function VaultEmptyState({ art = 'projects', title, description, action, className = '' }: {
  art?: VaultEmptyArt;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return <div className={`vault-empty ${className}`.trim()} role="status">
    <EmptyArt art={art} />
    <strong>{title}</strong>
    {description && <span>{description}</span>}
    {action && <div className="vault-empty__action">{action}</div>}
  </div>;
}
