import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import { VaultBadge } from '../base/VaultControls';

/**
 * Cổng AI — application components (v115, contract v0.1): provider tile and status badge (the gateway page), and
 * the orrery orb (the landing's illustration; the gateway page has no mascot since v115b). Presentational only.
 */

export type GatewayTone = 'success' | 'warning' | 'danger' | 'info' | 'category';

/** 32 (or 40) square tile with the provider's two-letter mark in mono. */
export function GatewayProviderTile({ mark, name, size = 'md', state }: { mark: string; name: string; size?: 'sm' | 'md' | 'lg'; state?: 'ok' | 'down' | 'idle' }) {
  return <span className="gw-provider" data-size={size} data-state={state} title={name} aria-label={name} role="img">{mark}</span>;
}

/** Labels for the contract's statuses: machine, connection, job and approval. Unknown values show as-is. */
const STATUS: Record<'machine' | 'connection' | 'job' | 'approval', Record<string, [string, GatewayTone]>> = {
  machine: { online: ['Online', 'success'], offline: ['Offline', 'danger'] },
  connection: { ready: ['Sẵn sàng', 'success'], offline: ['Offline', 'danger'], needs_login: ['Cần đăng nhập', 'warning'], limited: ['Chạm giới hạn', 'warning'], error: ['Lỗi', 'danger'], unsupported: ['Chưa hỗ trợ', 'category'] },
  job: { queued: ['Đang xếp hàng', 'info'], running: ['Đang chạy', 'info'], awaiting_approval: ['Chờ duyệt', 'warning'], stopping: ['Đang dừng', 'info'], completed: ['Xong', 'success'], stopped: ['Đã dừng', 'category'], failed: ['Lỗi', 'danger'], unknown: ['Chưa rõ', 'warning'] },
  approval: { pending: ['Chờ duyệt', 'warning'], allowed: ['Đã cho phép', 'success'], denied: ['Đã từ chối', 'danger'], expired: ['Hết hạn', 'category'] },
};

export function GatewayStatusBadge({ kind, status }: { kind: 'machine' | 'connection' | 'job' | 'approval'; status: string }) {
  const [label, tone] = STATUS[kind][status] ?? [status, 'category'];
  return <VaultBadge tone={tone}>{label}</VaultBadge>;
}

/** Tone of a connection or machine status, for dots and meters. */
export const gatewayStatusTone = (kind: 'machine' | 'connection' | 'job' | 'approval', status: string): GatewayTone => STATUS[kind][status]?.[1] ?? 'category';

/* ---------------------------------------------------------------- Agent bot */

export type GatewayAgentState = 'idle' | 'checking' | 'speaking' | 'blocked' | 'paused';

const BOT_LABEL: Record<GatewayAgentState, string> = { idle: 'sẵn sàng', checking: 'đang chờ', speaking: 'đang làm', blocked: 'lỗi', paused: 'tạm dừng' };

/**
 * Orbits of the agent (v103, user's reference: an orrery — "big things have small beginnings"). Each is an ellipse
 * (rx, ry, tilt) drawn as a thin line in one of two inks (light / steel blue), turning at its own speed and direction.
 * `bold` marks the tall blue ellipse that crosses the system.
 */
const ORBITS = [
  { id: 'o1', rx: 168, ry: 118, tilt: 52, ink: 'a', w: 1, d: 64, dir: 1 },
  { id: 'o2', rx: 174, ry: 112, tilt: -34, ink: 'b', w: 1.3, d: 80, dir: -1 },
  { id: 'o3', rx: 122, ry: 96, tilt: 28, ink: 'a', w: 1.2, d: 46, dir: 1 },
  { id: 'o4', rx: 134, ry: 68, tilt: -18, ink: 'b', w: 1.2, d: 52, dir: -1 },
  { id: 'o5', rx: 150, ry: 92, tilt: 8, ink: 'a', w: .9, d: 90, dir: 1, dim: true },
  { id: 'o6', rx: 162, ry: 132, tilt: 64, ink: 'b', w: 1, d: 110, dir: -1, dim: true },
  { id: 'o7', rx: 104, ry: 82, tilt: -48, ink: 'a', w: 1, d: 38, dir: -1 },
  { id: 'o8', rx: 20, ry: 162, tilt: -16, ink: 'b', w: 2.6, d: 72, dir: 1, bold: true },
];

/**
 * The agent as an orrery (v103, replaces the glowing orb): a small stone sphere at the centre, a flat ring through it
 * (its far half passes behind the sphere), thin elliptic orbits in light and steel blue at many tilts, two ticked
 * rings and a dotted ring — every orbit turning slowly at its own speed and direction. The whole system leans a few
 * degrees towards the pointer. checking = orbits spin faster and an outer arc fills with the progress · speaking =
 * the orbits breathe and the sphere lifts · blocked = the inks turn red · paused = still and dim · a tap spins it up
 * for a moment. Square; `size` sets the edge (default: the height of its box). Still under reduced motion.
 */
export function GatewayAgentBot({ name, color, state = 'idle', progress = 0, size }: { name: string; color: number; state?: GatewayAgentState; progress?: number; size?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const uid = useId().replace(/:/g, '');
  const compact = size !== undefined && size < 96;
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [spun, setSpun] = useState(false);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (compact) return;
    const move = (event: PointerEvent) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      const dx = event.clientX - (box.left + box.width / 2), dy = event.clientY - (box.top + box.height / 2);
      const length = Math.hypot(dx, dy) || 1;
      const reach = Math.min(1, length / 700);
      setLook({ x: dx / length * reach, y: dy / length * reach });
    };
    window.addEventListener('pointermove', move);
    return () => { window.removeEventListener('pointermove', move); if (spinTimer.current) clearTimeout(spinTimer.current); };
  }, [compact]);
  const spin = () => { setSpun(true); if (spinTimer.current) clearTimeout(spinTimer.current); spinTimer.current = setTimeout(() => setSpun(false), 1600); };
  const follow = state === 'idle' || state === 'speaking' ? look : { x: 0, y: 0 };
  const fill = Math.max(0, Math.min(1, progress));
  const arc = 2 * Math.PI * 192;
  const style = {
    '--gw-bot-tone': `var(--ds-color-category-${Math.min(7, Math.max(1, color))})`,
    '--gw-orrery-tilt': `${(follow.x * 7).toFixed(2)}deg`, '--gw-orrery-lean': `${(follow.y * 4).toFixed(2)}%`,
    ...(size !== undefined ? { width: size, height: size } : {}),
  } as CSSProperties;
  return <div ref={ref} className="gw-bot gw-orb gw-orrery" data-state={state} data-compact={compact || undefined} data-spun={spun || undefined}
    role="img" aria-label={`${name}: ${BOT_LABEL[state]}`} style={style} onPointerDown={state === 'idle' || state === 'speaking' ? spin : undefined}>
    <svg viewBox="0 0 400 400" aria-hidden="true">
      <defs>
        {/* Hairline 3D (v114): every line is 1px and fades out at both ends, so depth reads from light, not mass. */}
        <linearGradient id={`${uid}-a`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: 'var(--gw-orrery-a)', stopOpacity: 0 }} /><stop offset=".5" style={{ stopColor: 'var(--gw-orrery-a)' }} /><stop offset="1" style={{ stopColor: 'var(--gw-orrery-a)', stopOpacity: 0 }} /></linearGradient>
        <linearGradient id={`${uid}-b`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: 'var(--gw-orrery-b)', stopOpacity: 0 }} /><stop offset=".5" style={{ stopColor: 'var(--gw-orrery-b)' }} /><stop offset="1" style={{ stopColor: 'var(--gw-orrery-b)', stopOpacity: 0 }} /></linearGradient>
      </defs>
      <g className="gw-orrery__system">
        {!compact && <>
          <circle className="gw-orrery__dots" cx="200" cy="200" r="186" />
          <ellipse className="gw-orrery__dots is-wide" cx="200" cy="200" rx="192" ry="176" />
          <circle className="gw-orrery__ticks" cx="200" cy="200" r="158" />
          <circle className="gw-orrery__ticks is-inner" cx="200" cy="200" r="116" />
          <line className="gw-orrery__axis" x1="72" y1="124" x2="328" y2="276" stroke={`url(#${uid}-a)`} />
          <line className="gw-orrery__axis" x1="96" y1="300" x2="300" y2="96" stroke={`url(#${uid}-a)`} />
        </>}
        {ORBITS.filter(orbit => !compact || !orbit.dim).map(orbit => <g key={orbit.id} className="gw-orrery__orbit" data-ink={orbit.ink} data-dim={orbit.dim || undefined} data-bold={orbit.bold || undefined}
          style={{ '--tilt': `${orbit.tilt}deg`, '--d': `${orbit.d}s`, '--dir': orbit.dir } as CSSProperties}>
          <ellipse cx="200" cy="200" rx={orbit.rx} ry={orbit.ry} stroke={`url(#${uid}-${orbit.ink})`} />
        </g>)}
        {/* Flat ring: the far half goes behind the sphere, the near half in front. */}
        <g className="gw-orrery__ring is-back">
          <path d="M 18 200 A 182 11 0 0 1 382 200" />
          <path className="is-inner" d="M 34 200 A 166 7 0 0 1 366 200" />
        </g>
        <g className="gw-orrery__planet">
          {/* A wireframe globe instead of a solid stone: dark core (hides the far half of the ring), outline, latitudes and turning meridians. */}
          <circle className="gw-orrery__core" cx="200" cy="200" r="36" />
          <g className="gw-orrery__globe">
            <ellipse className="gw-orrery__lat" cx="200" cy="176" rx="26.8" ry="8.0" /><ellipse className="gw-orrery__lat" cx="200" cy="188" rx="33.9" ry="10.2" /><ellipse className="gw-orrery__lat" cx="200" cy="200" rx="36.0" ry="10.8" /><ellipse className="gw-orrery__lat" cx="200" cy="212" rx="33.9" ry="10.2" /><ellipse className="gw-orrery__lat" cx="200" cy="224" rx="26.8" ry="8.0" />
            {[0, 1, 2, 3].map(index => <ellipse key={index} className="gw-orrery__meridian" cx="200" cy="200" rx="36" ry="36" style={{ '--m': index } as CSSProperties} />)}
          </g>
          <circle className="gw-orrery__rim" cx="200" cy="200" r="36" />
        </g>
        <g className="gw-orrery__ring">
          <path d="M 18 200 A 182 11 0 0 0 382 200" />
          <path className="is-inner" d="M 34 200 A 166 7 0 0 0 366 200" />
        </g>
        {state === 'checking' && !compact && <circle className="gw-orrery__progress" cx="200" cy="200" r="192" strokeDasharray={`${(fill * arc).toFixed(1)} ${arc.toFixed(1)}`} transform="rotate(-90 200 200)" />}
      </g>
    </svg>
  </div>;
}
