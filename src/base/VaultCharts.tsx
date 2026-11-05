import { useId, type CSSProperties, type ReactNode } from 'react';

const clampPercent = (value: number) => Math.max(0, Math.min(100, value));

const smoothPath = (points: Array<{ x: number; y: number }>) => {
  if (!points.length) return '';
  return points.slice(0, -1).reduce((path, point, index) => {
    const previous = points[index - 1] ?? point;
    const next = points[index + 1];
    const afterNext = points[index + 2] ?? next;
    const control1 = { x: point.x + (next.x - previous.x) / 6, y: point.y + (next.y - previous.y) / 6 };
    const control2 = { x: next.x - (afterNext.x - point.x) / 6, y: next.y - (afterNext.y - point.y) / 6 };
    return `${path} C ${control1.x} ${control1.y}, ${control2.x} ${control2.y}, ${next.x} ${next.y}`;
  }, `M ${points[0].x} ${points[0].y}`);
};

export function VaultSegmentMeter({ label, value, unit = '%', segments = 12, icon }: {
  label: string;
  value: number;
  unit?: string;
  segments?: number;
  icon?: ReactNode;
}) {
  const safeValue = clampPercent(value);
  const active = Math.round((safeValue / 100) * segments);
  return <figure className="vault-chart vault-chart--meter" role="img" aria-label={`${label}: ${value}${unit}`}>
    <figcaption><span>{label}</span>{icon && <i>{icon}</i>}</figcaption>
    <strong>{value}<small>{unit}</small></strong>
    <span className="vault-chart__segments" aria-hidden="true">{Array.from({ length: segments }, (_, index) => <i key={index} data-active={index < active || undefined} />)}</span>
  </figure>;
}

export function VaultDotMeter({ label, value, unit = '°C', max = 600, dots = 16 }: {
  label: string;
  value: number;
  unit?: string;
  max?: number;
  dots?: number;
}) {
  const active = Math.round(clampPercent((value / Math.max(1, max)) * 100) / 100 * dots);
  return <figure className="vault-chart vault-chart--meter" role="img" aria-label={`${label}: ${value}${unit}`}>
    <figcaption><span>{label}</span></figcaption>
    <strong>{value}<small>{unit}</small></strong>
    <span className="vault-chart__dots" aria-hidden="true">{Array.from({ length: dots }, (_, index) => <i key={index} data-active={index < active || undefined} />)}</span>
  </figure>;
}

export function VaultRadialGauge({ label, value, unit = '%', icon }: {
  label: string;
  value: number;
  unit?: string;
  icon?: ReactNode;
}) {
  const safeValue = clampPercent(value);
  const ticks = 36;
  const active = Math.round((safeValue / 100) * ticks);
  return <figure className="vault-chart vault-chart--radial" role="img" aria-label={`${label}: ${value}${unit}`}>
    <figcaption>{label}</figcaption>
    <div><svg viewBox="0 0 120 120" aria-hidden="true">{Array.from({ length: ticks }, (_, index) => <line key={index} x1="60" y1="8" x2="60" y2="18" transform={`rotate(${index * 10} 60 60)`} data-active={index < active || undefined} />)}</svg><span>{icon}{!icon && <><strong>{value}</strong><small>{unit}</small></>}</span></div>
  </figure>;
}

export function VaultArcGauge({ label, value, min = 0, max = 100, startLabel = 'LOW', endLabel = 'HIGH' }: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  startLabel?: string;
  endLabel?: string;
}) {
  const progress = clampPercent(((value - min) / Math.max(1, max - min)) * 100);
  const angle = -90 + progress * 1.8;
  return <figure className="vault-chart vault-chart--arc" role="img" aria-label={`${label}: ${value}`}>
    <figcaption>{label}</figcaption>
    <div><svg viewBox="0 0 160 105" aria-hidden="true"><path className="vault-chart__arc-track" d="M16 92 A64 64 0 0 1 144 92" pathLength="100" /><path className="vault-chart__arc-value" d="M16 92 A64 64 0 0 1 144 92" pathLength="100" strokeDasharray={`${progress} ${100 - progress}`} /><line x1="80" y1="92" x2="80" y2="28" transform={`rotate(${angle} 80 92)`} /><circle cx="80" cy="92" r="4" /></svg><strong>{value}</strong></div>
    <footer><span>{startLabel}</span><span>{endLabel}</span></footer>
  </figure>;
}

export function VaultLineChart({ label, data, unit = '', highlightIndex }: {
  label: string;
  data: number[];
  unit?: string;
  highlightIndex?: number;
}) {
  const id = useId().replace(/:/g, '');
  const values = data.length > 1 ? data : [0, 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => ({ x: 12 + index * (336 / (values.length - 1)), y: 138 - ((value - min) / Math.max(1, max - min)) * 112 }));
  const line = smoothPath(points);
  const area = `${line} L ${points.at(-1)?.x} 148 L ${points[0].x} 148 Z`;
  const focus = points[Math.max(0, Math.min(points.length - 1, highlightIndex ?? Math.floor(points.length / 2)))];
  const markerStyle = { left: `${focus.x / 360 * 100}%`, top: `${focus.y / 160 * 100}%` };
  return <figure className="vault-chart vault-chart--line" role="img" aria-label={`${label}: ${values.at(-1)}${unit}`}>
    <figcaption><span>{label}</span><strong>{values.at(-1)}{unit}</strong></figcaption>
    <div className="vault-chart__plot"><svg viewBox="0 0 360 160" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".34" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient><linearGradient id={`${id}-tail`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="white" stopOpacity="0" /><stop offset=".14" stopColor="white" stopOpacity="1" /><stop offset=".82" stopColor="white" stopOpacity="1" /><stop offset="1" stopColor="white" stopOpacity="0" /></linearGradient><linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="currentColor" stopOpacity="0" /><stop offset=".14" stopColor="currentColor" stopOpacity="1" /><stop offset=".82" stopColor="currentColor" stopOpacity="1" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient><mask id={`${id}-mask`}><rect width="360" height="160" fill={`url(#${id}-tail)`} /></mask></defs><path className="vault-chart__area" d={area} style={{ fill: `url(#${id}-area)` }} mask={`url(#${id}-mask)`} /><path className="vault-chart__line" d={line} style={{ stroke: `url(#${id}-stroke)` }} /></svg><i className="vault-chart__marker" style={markerStyle} /></div>
  </figure>;
}

export function VaultSparkline({ label, data, tone = 'category' }: {
  label: string;
  data: number[];
  tone?: 'success' | 'danger' | 'category';
}) {
  const id = useId().replace(/:/g, '');
  const values = data.length > 1 ? data : [0, 0];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const points = values.map((value, index) => ({ x: index * (240 / (values.length - 1)), y: 50 - ((value - min) / Math.max(1, max - min)) * 44 }));
  const line = smoothPath(points);
  const area = `${line} L 240 56 L 0 56 Z`;
  return <svg className="vault-sparkline" data-tone={tone} viewBox="0 0 240 56" role="img" aria-label={label} preserveAspectRatio="none">
    <defs><linearGradient id={`${id}-spark-area`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="currentColor" stopOpacity=".24" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></linearGradient></defs>
    <path className="vault-sparkline__area" d={area} style={{ fill: `url(#${id}-spark-area)` }} aria-hidden="true" />
    <path className="vault-sparkline__line" d={line} aria-hidden="true" />
  </svg>;
}

export function VaultColumnChart({ label, data, unit = '', highlightIndex }: {
  label: string;
  data: Array<{ label: string; value: number }>;
  unit?: string;
  highlightIndex?: number;
}) {
  const rows = data.length ? data : [{ label: '—', value: 0 }];
  const max = Math.max(1, ...rows.map(item => item.value));
  const selected = Math.max(0, Math.min(rows.length - 1, highlightIndex ?? rows.length - 1));
  return <figure className="vault-chart vault-chart--columns" role="img" aria-label={`${label}: ${rows.map(item => `${item.label} ${item.value}${unit}`).join(', ')}`}>
    <figcaption><span>{label}</span><strong>{rows[selected].value}{unit}</strong></figcaption>
    <div className="vault-chart__columns" aria-hidden="true" data-dense={rows.length > 10 || undefined} style={{ '--vault-columns': rows.length } as CSSProperties}>{rows.map((item, index) => {
      const height = Math.max(8, item.value / max * 100);
      const opacity = .34 + index * (.66 / Math.max(1, rows.length - 1));
      return <span key={item.label} data-highlight={index === selected || undefined} style={{ '--vault-column-height': `${height}%`, '--vault-column-opacity': opacity } as CSSProperties}><b className="vault-chart__value-badge">{item.value}</b><i /><small>{item.label}</small></span>;
    })}</div>
  </figure>;
}

export function VaultBarList({ label, rows, segments = 16 }: {
  label: string;
  rows: Array<{ label: string; value: number; display?: string }>;
  segments?: number;
}) {
  return <figure className="vault-chart vault-chart--bars" role="img" aria-label={`${label}: ${rows.map(row => `${row.label} ${row.display || row.value}`).join(', ')}`}>
    <figcaption>{label}</figcaption>
    <div>{rows.map(row => { const active = Math.round(clampPercent(row.value) / 100 * segments); return <span key={row.label}><b>{row.label}</b><em aria-hidden="true">{Array.from({ length: segments }, (_, index) => <i key={index} data-active={index < active || undefined} />)}</em><strong>{row.display || `${row.value}%`}</strong></span>; })}</div>
  </figure>;
}
