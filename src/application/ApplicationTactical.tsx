import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import { RiArrowRightSLine, RiCheckLine, RiCornerDownLeftLine, RiLockLine } from '@remixicon/react';
import { VaultBadge } from '../base/VaultControls';
import './ApplicationTactical.css';

/*
 * Tactical — "tactical modernism" components (from the VEX homepage direction, made general).
 * Control, not decoration: hairline rules, a grid, type, and state shown ONLY by colour.
 * No cut corners, no HUD tags, no glows, no rounded corners, no heavy borders.
 * Mono (uppercase, tracked) carries labels, logs, tables and time codes; sans carries statements.
 * Colour: neutral by default · info = checking/cleared · action = waiting for you · success = signed · danger = blocked.
 */

export type TacticalState = 'idle' | 'checking' | 'cleared' | 'awaiting' | 'signed' | 'blocked';
const STATE_LABEL: Record<TacticalState, string> = {
  idle: 'Sẵn sàng', checking: 'Đang kiểm', cleared: 'Đạt', awaiting: 'Chờ bạn', signed: 'Đã ký', blocked: 'Bị chặn',
};

/** State tag: an 8px square and one uppercase mono word, both in the state colour. Nothing else. */
export function TacticalStatus({ state, label }: { state: TacticalState; label?: string }) {
  return <span className="tac-status" data-state={state} role="status"><i aria-hidden="true" />{label ?? STATE_LABEL[state]}</span>;
}

/** 16-segment bar. `breathe` = armed, `scan` = processing, `fill` = value 0–1, `full` = all lit. */
export function TacticalSegmentBar({ segments = 16, mode = 'off', value = 0, label }: { segments?: number; mode?: 'off' | 'breathe' | 'scan' | 'fill' | 'full'; value?: number; label?: string }) {
  const lit = mode === 'full' ? segments : mode === 'fill' ? Math.round(Math.max(0, Math.min(1, value)) * segments) : 0;
  return <span className="tac-bar" data-mode={mode} role={label ? 'meter' : undefined} aria-label={label} aria-valuenow={label ? Math.round(value * 100) : undefined} aria-valuemin={label ? 0 : undefined} aria-valuemax={label ? 100 : undefined} aria-hidden={label ? undefined : true} style={{ '--tac-segments': segments } as CSSProperties}>
    {Array.from({ length: segments }, (_, index) => <i key={index} data-on={index < lit || undefined} style={{ '--tac-i': index } as CSSProperties} />)}
  </span>;
}

export type TacticalKeyState = 'armed' | 'processing' | 'awaiting' | 'disabled';
/**
 * Command key (vEXIT): the one control of a flow — send, approve, next. A flat field (inverse surface),
 * one word, a 16-segment state bar and a ↵ cell. armed = bar breathes · processing = scanner on the bar ·
 * awaiting = the whole field takes the action colour. Down on press, a sweep of the bar on release.
 * Enter / Space press it when focused; pass `globalEnter` to also take Enter anywhere on the page body.
 */
export function TacticalKey({ label = 'vEXIT', state = 'armed', caption, onPress, globalEnter = false }: {
  label?: string;
  state?: TacticalKeyState;
  /** One short line above the word, e.g. "Gửi lệnh" / "Duyệt". */
  caption?: ReactNode;
  onPress?: () => void;
  globalEnter?: boolean;
}) {
  const [down, setDown] = useState(false);
  const [fire, setFire] = useState(0);
  const disabled = state === 'disabled';
  const release = useCallback(() => { setDown(false); setFire(value => value + 1); onPress?.(); }, [onPress]);
  useEffect(() => {
    if (!globalEnter || disabled) return;
    const onDown = (event: globalThis.KeyboardEvent) => { if (event.key === 'Enter' && !event.repeat && document.activeElement === document.body) setDown(true); };
    const onUp = (event: globalThis.KeyboardEvent) => { if (event.key === 'Enter' && document.activeElement === document.body) release(); };
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => { window.removeEventListener('keydown', onDown); window.removeEventListener('keyup', onUp); };
  }, [globalEnter, disabled, release]);
  const onKey = (event: KeyboardEvent<HTMLButtonElement>, phase: 'down' | 'up') => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    if (phase === 'down' && !event.repeat) setDown(true);
    if (phase === 'up' && down) release();
  };
  return <button
    type="button"
    className="tac-key"
    data-state={state}
    data-down={down || undefined}
    disabled={disabled}
    aria-label={`${label}${caption && typeof caption === 'string' ? `: ${caption}` : ''}`}
    onPointerDown={event => { if (event.button === 0) setDown(true); }}
    onPointerUp={() => { if (down) release(); }}
    onPointerLeave={() => setDown(false)}
    onKeyDown={event => onKey(event, 'down')}
    onKeyUp={event => onKey(event, 'up')}
  >
    <span className="tac-key__main">
      {caption && <span className="tac-key__caption">{caption}</span>}
      <strong>{label}</strong>
      <TacticalSegmentBar key={fire} mode={state === 'processing' ? 'scan' : state === 'awaiting' ? 'full' : state === 'armed' ? 'breathe' : 'off'} />
    </span>
    <span className="tac-key__enter" aria-hidden="true"><RiCornerDownLeftLine /></span>
  </button>;
}

/* --------------------------------------------------------------- Transcript */

export type TacticalEntry = {
  id: string;
  /** Speaker code in the mono column, e.g. VEX, BẠN, SYS. */
  who: string;
  /** Time code, e.g. T+02.3. */
  at: string;
  kind: 'agent' | 'user' | 'tool';
  text: string;
  /** Tool lines: OK / FAIL in the state colour. */
  result?: 'ok' | 'fail';
  /** Agent line still typing: shows the thin cursor. */
  typing?: boolean;
};

/**
 * Transcript (not chat bubbles): each entry is a row with a hairline above. A mono column gives the speaker and
 * a time code; the words sit beside it in sans. Your lines take the same row, set right and quieter.
 * Tool calls are a two-line mono log ("OK  ETH PRICE / BASE").
 */
export function TacticalTranscript({ entries, label = 'Bản ghi' }: { entries: TacticalEntry[]; label?: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [entries.length]);
  return <div className="tac-log" role="log" aria-label={label} aria-live="polite">
    {entries.map(entry => <div key={entry.id} className="tac-log__row" data-kind={entry.kind}>
      <span className="tac-log__who"><b>{entry.who}</b><small>{entry.at}</small></span>
      {entry.kind === 'tool'
        ? <span className="tac-log__tool" data-result={entry.result}><b>{entry.result === 'fail' ? 'FAIL' : 'OK'}</b><span>{entry.text}</span></span>
        : <p className="tac-log__text" data-typing={entry.typing || undefined}>{entry.text}</p>}
    </div>)}
    <div ref={end} />
  </div>;
}

/* -------------------------------------------------------------- Check sheet */

export type TacticalCheck = { key: string; label: string; value: string; limit: string; state: 'pending' | 'run' | 'pass' | 'fail' };

/**
 * Check sheet (the order): a table between two rules. Header row = mono title + status; the subject in large
 * type and its route in mono; one row per limit (value / limit, PASS or FAIL); footer = the next action + countdown.
 */
export function TacticalCheckSheet({ title, status, headline, route, checks, footer, countdown }: {
  title: string;
  status: TacticalState;
  headline: ReactNode;
  route?: ReactNode;
  checks: TacticalCheck[];
  footer?: ReactNode;
  /** Seconds left for the decision; shown as 00:09. */
  countdown?: number;
}) {
  return <section className="tac-sheet" data-state={status} aria-label={title}>
    <header><span className="tac-mono">{title}</span><TacticalStatus state={status} /></header>
    <div className="tac-sheet__subject"><strong>{headline}</strong>{route && <span className="tac-mono">{route}</span>}</div>
    <ol>
      {checks.map(check => <li key={check.key} data-state={check.state}>
        <span>{check.label}</span>
        <span className="tac-mono">{check.value} / {check.limit}</span>
        <b className="tac-mono">{check.state === 'pass' ? 'PASS' : check.state === 'fail' ? 'FAIL' : check.state === 'run' ? '····' : '—'}</b>
      </li>)}
    </ol>
    {(footer || countdown !== undefined) && <footer><span className="tac-mono">{footer}</span>{countdown !== undefined && <span className="tac-mono tac-sheet__count">{`00:${String(Math.max(0, countdown)).padStart(2, '0')}`}</span>}</footer>}
  </section>;
}

/* ------------------------------------------------------------- Limits sheet */

export type TacticalLimit = { key: string; label: string; value: string; state?: 'run' | 'ok' | 'no' };

/** Limits sheet: the rules the runtime reads. The row being checked lights; pass = info, fail = danger + struck value. */
export function TacticalLimits({ title, caption, items }: { title: string; caption?: string; items: TacticalLimit[] }) {
  return <section className="tac-limits" aria-label={title}>
    <header><strong>{title}</strong>{caption && <small>{caption}</small>}</header>
    <ol>{items.map(item => <li key={item.key} data-state={item.state}><i aria-hidden="true" /><span>{item.label}</span><b>{item.value}</b></li>)}</ol>
  </section>;
}

/* ------------------------------------------------------------------ Readout */

export type TacticalReading = { label: string; value: string; unit?: string; delta?: string; tone?: 'up' | 'down' };

/** Telemetry readout: cells divided by hairlines; mono label on top, the value large, unit and delta in mono. */
export function TacticalReadout({ items, label = 'Chỉ số' }: { items: TacticalReading[]; label?: string }) {
  return <dl className="tac-readout" aria-label={label}>
    {items.map(item => <div key={item.label}>
      <dt className="tac-mono">{item.label}</dt>
      <dd><strong>{item.value}</strong>{item.unit && <span className="tac-mono">{item.unit}</span>}{item.delta && <span className="tac-mono" data-tone={item.tone}>{item.delta}</span>}</dd>
    </div>)}
  </dl>;
}

/* ---------------------------------------------------------------- Cell bar */

export type TacticalCell = { key: string; label: string; icon?: ReactNode; code?: string; tone?: 'action' };

/** Header of cells: full-bleed, every item a cell divided by hairlines, a line icon that nudges on hover; `tone: action` fills a cell (the primary). */
export function TacticalCellBar({ items, value, onChange, label = 'Điều hướng' }: { items: TacticalCell[]; value?: string; onChange?: (key: string) => void; label?: string }) {
  return <nav className="tac-cells" aria-label={label}>
    {items.map(item => <button key={item.key} type="button" data-tone={item.tone} aria-current={value === item.key ? 'page' : undefined} onClick={() => onChange?.(item.key)}>
      {item.icon && <span className="tac-cells__icon" aria-hidden="true">{item.icon}</span>}
      <span>{item.label}</span>
      {item.code && <small className="tac-mono">{item.code}</small>}
    </button>)}
  </nav>;
}

/* ----------------------------------------------------------------- Console */

type Scenario = { title: string; headline: string; route: string; checks: Array<Omit<TacticalCheck, 'state'> & { result: 'pass' | 'fail' }>; ask: string };
const SCENARIOS: Scenario[] = [
  {
    title: 'DEPLOY / SALA MAP', headline: 'Xuất bản bản đồ SALA v4', route: 'VA-024 → vault.visal.studio',
    checks: [
      { key: 'size', label: 'Dung lượng ảnh', value: '3.4 MB', limit: '5 MB', result: 'pass' },
      { key: 'contrast', label: 'Tương phản chữ', value: '7.2', limit: '4.5', result: 'pass' },
      { key: 'links', label: 'Link hỏng', value: '0', limit: '0', result: 'pass' },
    ],
    ask: 'Đạt. Quyết định của bạn.',
  },
  {
    title: 'DEPLOY / LEARN', headline: 'Xuất bản khoá học Brand Systems', route: 'VA-020 → learn.visal.studio',
    checks: [
      { key: 'size', label: 'Dung lượng ảnh', value: '48 MB', limit: '5 MB', result: 'fail' },
      { key: 'contrast', label: 'Tương phản chữ', value: '3.1', limit: '4.5', result: 'fail' },
      { key: 'links', label: 'Link hỏng', value: '0', limit: '0', result: 'pass' },
    ],
    ask: 'Bị chặn. Vượt giới hạn. Không xuất bản.',
  },
];
const LIMITS: TacticalLimit[] = [
  { key: 'size', label: 'Ảnh tối đa', value: '5 MB' },
  { key: 'contrast', label: 'Tương phản tối thiểu', value: 'AA 4.5' },
  { key: 'links', label: 'Link hỏng', value: '0' },
  { key: 'sign', label: 'Người duyệt', value: 'Bạn, trên máy này' },
];

/**
 * Tactical console — the components working together (a simulated run, nothing is published):
 * press the key → the agent finds the subject → each limit row lights while it is checked →
 * cleared (awaiting you, the key turns action) or blocked → press again to sign → next run.
 */
export function TacticalConsole() {
  const [entries, setEntries] = useState<TacticalEntry[]>([{ id: 'hi', who: 'AGENT', at: 'T+00.0', kind: 'agent', text: 'Sẵn sàng. Nhấn vEXIT để chạy lệnh.' }]);
  const [keyState, setKeyState] = useState<TacticalKeyState>('armed');
  const [sheet, setSheet] = useState<{ scenario: Scenario; status: TacticalState; checks: TacticalCheck[]; countdown?: number } | null>(null);
  const [limits, setLimits] = useState<TacticalLimit[]>(LIMITS);
  const [round, setRound] = useState(0);
  const started = useRef(performance.now());
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const stamp = () => `T+${((performance.now() - started.current) / 1000).toFixed(1).padStart(4, '0')}`;
  const say = (entry: Omit<TacticalEntry, 'id' | 'at'>) => setEntries(list => [...list.slice(-7), { ...entry, id: `${Date.now()}-${Math.random()}`, at: stamp() }]);
  const mark = (key: string, state?: TacticalLimit['state']) => setLimits(list => list.map(item => item.key === key ? { ...item, state } : item));

  const run = () => {
    const scenario = SCENARIOS[round % SCENARIOS.length];
    setRound(value => value + 1);
    setLimits(LIMITS);
    setKeyState('processing');
    say({ who: 'BẠN', kind: 'user', text: `Chạy ${scenario.title.toLowerCase()}` });
    const checks: TacticalCheck[] = scenario.checks.map(({ result: _result, ...check }) => ({ ...check, state: 'pending' }));
    later(400, () => { say({ who: 'SYS', kind: 'tool', text: scenario.route.toUpperCase(), result: 'ok' }); setSheet({ scenario, status: 'checking', checks }); });
    later(900, () => say({ who: 'AGENT', kind: 'agent', text: 'Đã thấy bản cần xuất. Đang kiểm giới hạn.' }));
    let failed = false;
    scenario.checks.forEach((check, index) => {
      later(1400 + index * 650, () => { mark(check.key, 'run'); setSheet(current => current && { ...current, checks: current.checks.map(item => item.key === check.key ? { ...item, state: 'run' } : item) }); });
      later(1400 + index * 650 + 520, () => {
        if (check.result === 'fail') failed = true;
        mark(check.key, check.result === 'pass' ? 'ok' : 'no');
        setSheet(current => current && { ...current, checks: current.checks.map(item => item.key === check.key ? { ...item, state: check.result } : item) });
      });
    });
    later(1400 + scenario.checks.length * 650 + 300, () => {
      if (failed) {
        setSheet(current => current && { ...current, status: 'blocked', countdown: undefined });
        say({ who: 'AGENT', kind: 'agent', text: scenario.ask });
        setKeyState('armed');
      } else {
        setSheet(current => current && { ...current, status: 'awaiting', countdown: 9 });
        mark('sign', 'run');
        say({ who: 'AGENT', kind: 'agent', text: scenario.ask });
        setKeyState('awaiting');
      }
    });
  };
  const sign = () => {
    setKeyState('processing');
    later(500, () => {
      mark('sign', 'ok');
      setSheet(current => current && { ...current, status: 'signed', countdown: undefined });
      say({ who: 'AGENT', kind: 'agent', text: 'Đã ký bởi bạn. Đã xuất bản.' });
      setKeyState('armed');
    });
  };
  // Countdown while it waits for you; at zero the run lapses (nothing is signed).
  useEffect(() => {
    if (sheet?.status !== 'awaiting' || sheet.countdown === undefined) return;
    if (sheet.countdown <= 0) { setSheet(current => current && { ...current, status: 'idle', countdown: undefined }); mark('sign'); setKeyState('armed'); say({ who: 'AGENT', kind: 'agent', text: 'Hết giờ. Không có gì được ký.' }); return; }
    const id = window.setTimeout(() => setSheet(current => current && current.countdown !== undefined ? { ...current, countdown: current.countdown - 1 } : current), 1000);
    return () => window.clearTimeout(id);
  }, [sheet?.status, sheet?.countdown]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = () => { if (keyState === 'processing') return; if (keyState === 'awaiting') sign(); else run(); };

  return <section className="tac-console" aria-label="Tactical console">
    <div className="tac-console__main">
      <TacticalTranscript entries={entries} />
      {sheet && <TacticalCheckSheet
        title={sheet.scenario.title}
        status={sheet.status}
        headline={sheet.scenario.headline}
        route={sheet.scenario.route}
        checks={sheet.checks}
        footer={sheet.status === 'awaiting' ? 'vEXIT để duyệt' : sheet.status === 'blocked' ? 'Không có gì được ký' : sheet.status === 'signed' ? 'Đã ký · đã gửi' : 'Đang kiểm'}
        countdown={sheet.status === 'awaiting' ? sheet.countdown : undefined}
      />}
    </div>
    <aside className="tac-console__side">
      <TacticalLimits title="Giới hạn của bạn" caption="Runtime đọc trên mọi lệnh" items={limits} />
      <TacticalKey state={keyState} caption={keyState === 'awaiting' ? 'Duyệt' : keyState === 'processing' ? 'Đang chạy' : 'Chạy lệnh'} onPress={press} />
    </aside>
  </section>;
}

/* ===================================================================================
   Tactical · Vault set — the game-tactical grammar (square corners, accent rails, hex
   emblems, tinted result rows, diagonal stripes) applied to what Vault actually does:
   team & profile, Learn progress, achievements, deploy / run history, plan picking,
   master-plan hotspots, schedules, activity logs. Built only from theme tokens.
   =================================================================================== */

/** Hex emblem: a hexagon with a 2px rim (action or neutral) around an image or icon. Team, workspace, level, achievement. */
export function TacticalHex({ src, icon, alt = '', size = 'md', tone = 'action', badge }: {
  src?: string;
  icon?: ReactNode;
  alt?: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'action' | 'neutral' | 'success';
  /** Small mono tag under the emblem, e.g. a level "44". */
  badge?: ReactNode;
}) {
  return <span className="tac-hex" data-size={size} data-tone={tone}>
    <span className="tac-hex__rim" aria-hidden="true" />
    <span className="tac-hex__face">{src ? <img src={src} alt={alt} loading="lazy" /> : <span className="tac-hex__icon" aria-hidden={alt ? undefined : true}>{icon}</span>}</span>
    {badge !== undefined && <span className="tac-hex__badge">{badge}</span>}
  </span>;
}

/** Level bar: "Cấp [44]", a 4px progress line in the action colour, current / next in mono. */
export function TacticalLevel({ level, current, max, label = 'Cấp', unit = 'XP' }: { level: number; current: number; max: number; label?: string; unit?: string }) {
  const pct = Math.max(0, Math.min(100, current / max * 100));
  const fmt = (value: number) => value.toLocaleString('vi-VN');
  return <div className="tac-level" role="meter" aria-label={`${label} ${level}`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={current}>
    <span className="tac-level__head"><span className="tac-caps">{label}</span><b>[{level}]</b></span>
    <span className="tac-level__track" aria-hidden="true"><i style={{ width: `${pct}%` }} /></span>
    <span className="tac-level__nums tac-mono"><span>{fmt(current)} {unit}</span><span>{fmt(max)} {unit}</span></span>
  </div>;
}

export type TacticalStat = { key: string; label: string; value: string; icon?: ReactNode; tone?: 'action' | 'success' | 'info' | 'warning' | 'neutral'; /** Capacity 0–1: shows a segment strip. */ fill?: number };
/** Stat rows: a 2px accent rail in the stat's tone, the value large, the label under it, an icon chip on the right. `fill` adds a segment strip (capacity). */
export function TacticalStatList({ items, label = 'Chỉ số' }: { items: TacticalStat[]; label?: string }) {
  return <ul className="tac-stats" aria-label={label}>
    {items.map(item => <li key={item.key} data-tone={item.tone ?? 'neutral'}>
      <span className="tac-stats__copy"><strong>{item.value}</strong><small>{item.label}</small></span>
      {item.fill !== undefined && <TacticalSegmentBar segments={10} mode="fill" value={item.fill} label={`${item.label} ${Math.round(item.fill * 100)}%`} />}
      {item.icon && <span className="tac-stats__icon" aria-hidden="true">{item.icon}</span>}
    </li>)}
  </ul>;
}

/** Versus: two tinted blocks (success / danger), big numbers, labels under them. Done vs failed, income vs spend. */
export function TacticalVersus({ left, right }: { left: { value: string; label: string }; right: { value: string; label: string } }) {
  return <div className="tac-versus">
    <div data-tone="success"><strong>{left.value}</strong><small>{left.label}</small></div>
    <div data-tone="danger"><strong>{right.value}</strong><small>{right.label}</small></div>
  </div>;
}

/** History row: tinted by outcome, a slanted uppercase result word, two sides around VS, place + time, open chevron. Deploys, runs, reviews. */
export function TacticalResultRow({ outcome, result, left, right, place, time, onOpen }: {
  outcome: 'success' | 'danger';
  result: string;
  left: { role: string; name: string };
  right: { role: string; name: string };
  place: string;
  time: string;
  onOpen?: () => void;
}) {
  return <button type="button" className="tac-result" data-tone={outcome} onClick={onOpen} aria-label={`${result}: ${left.name} – ${right.name}, ${place}, ${time}`}>
    <span className="tac-result__word">{result}</span>
    <span className="tac-result__side"><small>{left.role}</small><strong>{left.name}</strong></span>
    <span className="tac-result__vs tac-mono">VS</span>
    <span className="tac-result__side"><small>{right.role}</small><strong>{right.name}</strong></span>
    <span className="tac-result__place"><strong>{place}</strong><small className="tac-mono">{time}</small></span>
    <span className="tac-result__open" aria-hidden="true"><RiArrowRightSLine /></span>
  </button>;
}

export type TacticalPin = { key: string; x: number; y: number; icon?: ReactNode; value: string; caption: string };
/** Hotspots on an image: pins at x / y % — an icon cell, the value, a caption. Master-plan buildings, board references, mock-up callouts. */
export function TacticalHotspots({ src, alt, pins, ratio = '16 / 9' }: { src: string; alt: string; pins: TacticalPin[]; ratio?: string }) {
  const [active, setActive] = useState('');
  return <figure className="tac-hotspots" style={{ aspectRatio: ratio } as CSSProperties}>
    <img src={src} alt={alt} loading="lazy" />
    {pins.map(pin => <button key={pin.key} type="button" className="tac-pin" data-active={active === pin.key || undefined} style={{ left: `${pin.x}%`, top: `${pin.y}%` } as CSSProperties} aria-label={`${pin.caption}: ${pin.value}`} onClick={() => setActive(current => current === pin.key ? '' : pin.key)}>
      {pin.icon && <span className="tac-pin__icon" aria-hidden="true">{pin.icon}</span>}
      <span className="tac-pin__copy"><strong>{pin.value}</strong><small>{pin.caption}</small></span>
    </button>)}
  </figure>;
}

export type TacticalOption = { value: string; label: string; price: string; badge?: string };
/** Plan / duration picker: square cards in a row; the chosen one gets the action rail and border. Radio semantics. */
export function TacticalOptionGroup({ options, value, onChange, label }: { options: TacticalOption[]; value: string; onChange: (value: string) => void; label: string }) {
  return <div className="tac-options" role="radiogroup" aria-label={label}>
    {options.map(option => <button key={option.value} type="button" role="radio" aria-checked={value === option.value} onClick={() => onChange(option.value)}>
      <span className="tac-options__head"><span className="tac-caps">{option.label}</span>{option.badge && <VaultBadge tone="warning">{option.badge}</VaultBadge>}</span>
      <strong>{option.price}</strong>
    </button>)}
  </div>;
}

export type TacticalRewardState = 'claim' | 'claimed' | 'locked';
/** Reward / achievement card: art cell, a level tag, Premium badge, and one action: Nhận (action), Đã nhận (success), Khoá (locked). */
export function TacticalRewardCard({ title, level, icon, image, premium = false, state, onClaim }: { title: string; level: string; icon?: ReactNode; /** Art image; replaces the icon. */ image?: string; premium?: boolean; state: TacticalRewardState; onClaim?: () => void }) {
  return <article className="tac-reward" data-state={state} aria-label={`${title}, ${level}`}>
    <header><span className="tac-caps">{title}</span></header>
    <span className="tac-mono tac-reward__level">{level}</span>
    {/* Premium sits on the art's corner so the title never shares a line with it. */}
    <span className="tac-reward__art"><span aria-hidden="true">{image ? <img src={image} alt="" loading="lazy" /> : icon}</span>{premium && <VaultBadge tone="warning">Premium</VaultBadge>}</span>
    <button type="button" className="tac-reward__action" disabled={state !== 'claim'} onClick={onClaim}>
      {state === 'claimed' ? <><RiCheckLine aria-hidden="true" />Đã nhận</> : state === 'locked' ? <><RiLockLine aria-hidden="true" />Khoá</> : 'Nhận'}
    </button>
  </article>;
}

/** Stripe banner: diagonal action stripes behind one uppercase line. Promotions, deadlines, "capture in progress". */
export function TacticalBanner({ children, tone = 'action' }: { children: ReactNode; tone?: 'action' | 'warning' }) {
  return <p className="tac-banner" data-tone={tone}><span>{children}</span></p>;
}

export type TacticalDay = { day: number; src?: string; label?: string };
/** Day grid (territory / schedule): 7 columns of square cells, the number top-left; claimed days show an image with the action rim; one day is selected. */
export function TacticalCalendar({ days = 30, claimed = [], value, onChange, label = 'Lịch' }: { days?: number; claimed?: TacticalDay[]; value?: number; onChange?: (day: number) => void; label?: string }) {
  return <div className="tac-calendar" role="grid" aria-label={label}>
    {Array.from({ length: days }, (_, index) => {
      const day = index + 1;
      const own = claimed.find(item => item.day === day);
      return <button key={day} type="button" role="gridcell" aria-selected={value === day} data-claimed={own ? '' : undefined} aria-label={`Ngày ${day}${own?.label ? `, ${own.label}` : ''}`} onClick={() => onChange?.(day)}>
        <span className="tac-mono">{day}</span>
        {own?.src && <img src={own.src} alt="" loading="lazy" />}
      </button>;
    })}
  </div>;
}

export type TacticalMarker = { key: string; x: number; y: number; label: string; state?: 'idle' | 'contested' | 'owned' };
/** Map markers: a diamond and a label on a grid field; owned = action fill, contested = action rim, idle = neutral. Map, master plan, zones. */
export function TacticalMap({ markers, value, onChange, label = 'Bản đồ' }: { markers: TacticalMarker[]; value?: string; onChange?: (key: string) => void; label?: string }) {
  return <div className="tac-map" role="group" aria-label={label}>
    {markers.map(marker => <button key={marker.key} type="button" className="tac-marker" data-state={marker.state ?? 'idle'} aria-pressed={value === marker.key} data-side={marker.x > 60 ? 'left' : undefined} style={{ left: `${marker.x}%`, top: `${marker.y}%` } as CSSProperties} onClick={() => onChange?.(marker.key)}>
      <i aria-hidden="true" /><span>{marker.label}</span>
    </button>)}
  </div>;
}

export type TacticalLogItem = { key: string; label: string; time: string; date: string; tone?: 'success' | 'danger' | 'neutral' };
/** Activity log: rows with a 2px tone rail, the event, then time and date in their own mono cells. */
export function TacticalLogList({ items, label = 'Nhật ký' }: { items: TacticalLogItem[]; label?: string }) {
  return <ol className="tac-loglist" aria-label={label}>
    {items.map(item => <li key={item.key} data-tone={item.tone ?? 'success'}><span>{item.label}</span><time className="tac-mono">{item.time}</time><time className="tac-mono">{item.date}</time></li>)}
  </ol>;
}

/** Big square action with a 4px rail: the two-choice footer of a tactical dialog (hand over / remove). `danger` reddens the rail on hover only. */
export function TacticalAction({ children, tone = 'neutral', onClick, disabled = false }: { children: ReactNode; tone?: 'neutral' | 'danger' | 'action'; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" className="tac-action" data-tone={tone} disabled={disabled} onClick={onClick}><span>{children}</span></button>;
}

export type TacticalRank = { value: string; label: string; icon: ReactNode };
/** Rank / step picker: a column of hex buttons with labels; the chosen one fills with the action colour and gets a ▸ marker. Learn levels, roles, tiers. */
export function TacticalRankList({ items, value, onChange, label }: { items: TacticalRank[]; value: string; onChange: (value: string) => void; label: string }) {
  return <div className="tac-ranks" role="radiogroup" aria-label={label}>
    {items.map(item => <button key={item.value} type="button" role="radio" aria-checked={value === item.value} onClick={() => onChange(item.value)}>
      <TacticalHex size="sm" icon={item.icon} tone={value === item.value ? 'action' : 'neutral'} />
      <span>{item.label}</span>
    </button>)}
  </div>;
}

export type TacticalPerson = { key: string; name: string; src: string; code?: string };
/** Portrait strip: square portraits in a row; the chosen one gets the action underline and its name below the strip. Pick a member, an assignee, an avatar. */
export function TacticalPortraitStrip({ people, value, onChange, label }: { people: TacticalPerson[]; value: string; onChange: (key: string) => void; label: string }) {
  const chosen = people.find(person => person.key === value);
  return <div className="tac-portraits">
    <div role="radiogroup" aria-label={label}>
      {people.map(person => <button key={person.key} type="button" role="radio" aria-checked={value === person.key} aria-label={person.name} onClick={() => onChange(person.key)}>
        <img src={person.src} alt="" loading="lazy" />{person.code && <small className="tac-mono">{person.code}</small>}
      </button>)}
    </div>
    {chosen && <p className="tac-caps">{chosen.name}</p>}
  </div>;
}

export type TacticalPriceRow = { key: string; label: string; price: string; currency?: 'money' | 'credit' };
/** Price list: rows with an action rail on hover / selection, the label small on top and the price large under it; credits in the action colour. Invoices, add-ons, packages. */
export function TacticalPriceList({ rows, value, onChange, total, label = 'Bảng giá' }: { rows: TacticalPriceRow[]; value?: string; onChange?: (key: string) => void; total?: string; label?: string }) {
  return <div className="tac-prices">
    <div role="listbox" aria-label={label}>
      {rows.map(row => <button key={row.key} type="button" role="option" aria-selected={value === row.key} data-currency={row.currency ?? 'money'} onClick={() => onChange?.(row.key)}>
        <small>{row.label}</small><strong>{row.price}</strong>
      </button>)}
    </div>
    {total && <p className="tac-prices__total"><span>Tổng</span><strong>{total}</strong></p>}
  </div>;
}

/** Reward tile: a dark card with a short action tab at the top-left, a mono caption, a hex icon, the amount. Bundles, credits, perks. */
export function TacticalTile({ caption, value, icon }: { caption: string; value: string; icon: ReactNode }) {
  return <article className="tac-tile"><span className="tac-caps">{caption}</span><TacticalHex size="md" icon={icon} /><strong>{value}</strong></article>;
}
