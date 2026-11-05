import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import {
  RiAddLine, RiArrowDownSFill, RiArrowRightSLine, RiCheckLine, RiCloseLine, RiCodeSSlashLine, RiDatabase2Line,
  RiDownloadLine, RiExternalLinkLine, RiFileCodeLine, RiFileCopyLine, RiFileTextLine, RiFlowChart, RiFocus3Line,
  RiFolder3Line, RiFolderOpenLine, RiMailSendLine, RiMicFill, RiMicLine, RiPlayLine, RiRobot2Line, RiSubtractLine,
  RiTerminalBoxLine,
} from '@remixicon/react';
import { VaultBadge, VaultButton, VaultButtonGroup, VaultTabs } from '../base/VaultControls';
import { AIShimmer } from './ApplicationAI';
import './ApplicationAI.css';

/* --------------------------------------------------------------- Code block */

const KEYWORDS = /\b(const|let|var|function|return|import|from|export|type|interface|if|else|await|async|new|true|false|null|undefined)\b/;
const TOKEN = /(\/\/.*$|'[^']*'|"[^"]*"|`[^`]*`|\b\d+(?:\.\d+)?\b|\b[A-Za-z_]\w*\b|[{}()[\];,.:=<>+\-*/!?&|]+|\s+)/gm;
/** Shell and Python comment with `#`. */
const HASH_COMMENT = /^(bash|sh|shell|zsh|py|python|yaml|yml|toml)$/;

/** Splits a line into highlighted tokens; text the tokenizer does not recognise (accents, `$`, `\`, `#`) is kept as is. */
function highlight(line: string, hashComments = false): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = line;
  let tail: ReactNode = null;
  if (hashComments) {
    const at = line.search(/(^|\s)#/);
    if (at >= 0 && !/^\s*#!/.test(line)) { const start = line[at] === '#' ? at : at + 1; rest = line.slice(0, start); tail = <span key="hash" className="ai-tok-comment">{line.slice(start)}</span>; }
  }
  let last = 0;
  TOKEN.lastIndex = 0;
  for (let match = TOKEN.exec(rest); match; match = TOKEN.exec(rest)) {
    if (!match[0]) { TOKEN.lastIndex += 1; continue; }
    if (match.index > last) nodes.push(rest.slice(last, match.index));
    const token = match[0];
    const kind = token.startsWith('//') && !hashComments ? 'comment' : /^['"`]/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : KEYWORDS.test(token) && token.match(KEYWORDS)?.[0] === token ? 'keyword' : /^[A-Z]/.test(token) ? 'type' : undefined;
    nodes.push(kind ? <span key={match.index} className={`ai-tok-${kind}`}>{token}</span> : token);
    last = match.index + token.length;
  }
  if (last < rest.length) nodes.push(rest.slice(last));
  if (tail) nodes.push(tail);
  return nodes;
}

/** Code with a header (language, file, copy), line numbers and lightweight highlighting. */
export function AICodeBlock({ code, language = 'tsx', filename, showLineNumbers = true, highlightLines = [] }: { code: string; language?: string; filename?: string; showLineNumbers?: boolean; highlightLines?: number[] }) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, '').split('\n');
  return <figure className="ai-code">
    <figcaption>
      <RiCodeSSlashLine aria-hidden="true" />
      {filename && <strong>{filename}</strong>}
      <code>{language}</code>
      <VaultButton appearance="text" size="sm" iconOnly icon={copied ? <RiCheckLine /> : <RiFileCopyLine />} aria-label={copied ? 'Đã copy' : 'Copy code'} onClick={() => { void navigator.clipboard?.writeText(code).catch(() => undefined); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} />
    </figcaption>
    <pre><code>{lines.map((line, index) => <span key={index} className="ai-code__line" data-highlight={highlightLines.includes(index + 1) || undefined}>
      {showLineNumbers && <i aria-hidden="true">{index + 1}</i>}
      <span>{line ? highlight(line, HASH_COMMENT.test(language)) : ' '}</span>
    </span>)}</code></pre>
  </figure>;
}

/* ------------------------------------------------------------------ Terminal */

const TERMINAL_SCRIPT = [
  { text: '$ npm run build', kind: 'cmd' },
  { text: 'vite v8.0.0 building for production…', kind: 'out' },
  { text: '✓ 1,284 modules transformed.', kind: 'ok' },
  { text: 'dist/assets/index.css    186.42 kB │ gzip: 28.10 kB', kind: 'out' },
  { text: 'dist/assets/index.js     224.08 kB │ gzip: 71.92 kB', kind: 'out' },
  { text: '⚠ chunk ResourceLightbox is 141 kB', kind: 'warn' },
  { text: '✓ built in 2.41s', kind: 'ok' },
] as const;

/** Streaming terminal output on the inverse surface. Re-run replays the stream. */
export function AITerminal() {
  const [count, setCount] = useState(0);
  const [run, setRun] = useState(0);
  const bodyRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    setCount(0);
    const id = window.setInterval(() => setCount(value => { if (value >= TERMINAL_SCRIPT.length) { window.clearInterval(id); return value; } return value + 1; }), 380);
    return () => window.clearInterval(id);
  }, [run]);
  useEffect(() => { const el = bodyRef.current; if (el) el.scrollTop = el.scrollHeight; }, [count]);
  const running = count < TERMINAL_SCRIPT.length;
  return <section className="ai-terminal" aria-label="Terminal">
    <header>
      <RiTerminalBoxLine aria-hidden="true" /><strong>build</strong>
      <span className="ai-terminal__status" data-running={running || undefined}>{running ? 'Đang chạy' : 'Xong · 0 lỗi'}</span>
      <VaultButton appearance="text" size="sm" icon={<RiPlayLine />} onClick={() => setRun(value => value + 1)} disabled={running}>Chạy lại</VaultButton>
    </header>
    <pre ref={bodyRef} aria-live="polite">{TERMINAL_SCRIPT.slice(0, count).map((line, index) => <span key={index} data-kind={line.kind}>{line.text}{'\n'}</span>)}{running && <span className="ai-terminal__cursor" aria-hidden="true" />}</pre>
  </section>;
}

/* ------------------------------------------------------------------ Artifact */

const ARTIFACT_CODE = `export function MapLegend({ zones }: Props) {
  // Mỗi phân khu là một dòng 40px, swatch 12px
  return <ul className="legend">
    {zones.map(zone => <li key={zone.id}>{zone.label}</li>)}
  </ul>;
}`;

/** Generated output container: header actions, Preview / Code switch, version badge. */
export function AIArtifact() {
  const [view, setView] = useState<'preview' | 'code'>('preview');
  const [version, setVersion] = useState(3);
  return <section className="ai-artifact">
    <header>
      <span className="ai-artifact__icon" aria-hidden="true"><RiFileCodeLine /></span>
      <div><strong>MapLegend.tsx</strong></div>
      <VaultBadge tone="category">v{version}</VaultBadge>
      <VaultButtonGroup value={view} onChange={setView} label="Chế độ xem" size="sm" options={[{ value: 'preview', label: 'Preview' }, { value: 'code', label: 'Code' }]} />
      <span className="ai-artifact__actions">
        <VaultButton appearance="text" size="sm" iconOnly icon={<RiDownloadLine />} aria-label="Tải xuống" />
        <VaultButton appearance="text" size="sm" iconOnly icon={<RiExternalLinkLine />} aria-label="Mở trong tab mới" />
      </span>
    </header>
    <div className="ai-artifact__body">
      {view === 'preview'
        ? <div className="ai-artifact__preview"><ul className="ai-legend-demo">{[['#6D96E8', 'Nhà ở', 14], ['#D9965F', 'Thương mại', 6], ['#68B287', 'Cây xanh', 9], ['#9177D0', 'Giáo dục', 3]].map(([color, label, count]) => <li key={String(label)}><i style={{ background: String(color) }} /><span>{label}</span><b>{count}</b></li>)}</ul></div>
        : <AICodeBlock code={ARTIFACT_CODE} filename="MapLegend.tsx" highlightLines={[2]} />}
    </div>
    <footer><span>Cập nhật 2 phút trước</span><VaultButton appearance="text" size="sm" onClick={() => setVersion(value => Math.max(1, value - 1))} disabled={version <= 1}>Bản trước</VaultButton><VaultButton appearance="ghost" size="sm" onClick={() => setVersion(value => value + 1)}>Tạo lại</VaultButton></footer>
  </section>;
}

/* ----------------------------------------------------------------- File tree */

type TreeNode = { name: string; children?: TreeNode[]; status?: 'added' | 'modified' };
const TREE: TreeNode[] = [
  { name: 'src', children: [
    { name: 'design-system', children: [
      { name: 'base', children: [{ name: 'VaultOverlays.tsx', status: 'modified' }, { name: 'base.css', status: 'modified' }] },
      { name: 'application', children: [{ name: 'ApplicationAI.tsx', status: 'added' }, { name: 'ApplicationAI.css', status: 'added' }] },
    ] },
    { name: 'main.tsx' },
  ] },
  { name: 'package.json' },
];

/** Expandable file tree with change markers (A / M). Rows are 32px. */
export function AIFileTree({ onSelect }: { onSelect?: (path: string) => void }) {
  const [open, setOpen] = useState<Set<string>>(new Set(['src', 'src/design-system', 'src/design-system/application']));
  const [selected, setSelected] = useState('src/design-system/application/ApplicationAI.tsx');
  const render = (nodes: TreeNode[], depth: number, parent: string): ReactNode => nodes.map(node => {
    const path = parent ? `${parent}/${node.name}` : node.name;
    const isFolder = !!node.children;
    const expanded = open.has(path);
    return <li key={path} role="treeitem" aria-expanded={isFolder ? expanded : undefined} aria-selected={path === selected}>
      <button type="button" className="ai-tree__row" style={{ paddingLeft: 12 + depth * 16 }} data-selected={path === selected || undefined} onClick={() => {
        if (isFolder) setOpen(current => { const next = new Set(current); if (next.has(path)) next.delete(path); else next.add(path); return next; });
        else { setSelected(path); onSelect?.(path); }
      }}>
        {isFolder ? (expanded ? <RiArrowDownSFill aria-hidden="true" /> : <RiArrowRightSLine aria-hidden="true" />) : <i aria-hidden="true" />}
        {isFolder ? (expanded ? <RiFolderOpenLine aria-hidden="true" /> : <RiFolder3Line aria-hidden="true" />) : <RiFileTextLine aria-hidden="true" />}
        <span>{node.name}</span>
        {node.status && <code data-status={node.status}>{node.status === 'added' ? 'A' : 'M'}</code>}
      </button>
      {isFolder && expanded && <ul role="group">{render(node.children!, depth + 1, path)}</ul>}
    </li>;
  });
  return <nav className="ai-tree" aria-label="Tệp thay đổi"><span className="ai-label">Tệp · 4 thay đổi</span><ul role="tree">{render(TREE, 0, '')}</ul></nav>;
}

/* ----------------------------------------------------------- Code workspace */

/**
 * One coding surface instead of three loose cards: changed-files tree on the left,
 * base Tabs (Code / Terminal) on the right. Selecting a file opens it in the Code tab.
 */
export function AICodeWorkspace({ code, highlightLines = [] }: { code: string; highlightLines?: number[] }) {
  const [file, setFile] = useState('src/design-system/application/ApplicationAI.tsx');
  const [tab, setTab] = useState<'code' | 'terminal'>('code');
  return <section className="ai-workspace" aria-label="Khung làm việc code">
    <aside className="ai-workspace__tree"><AIFileTree onSelect={path => { setFile(path); setTab('code'); }} /></aside>
    <div className="ai-workspace__main">
      <VaultTabs label="Khung làm việc" value={tab} onChange={setTab} options={[{ value: 'code', label: 'Code', icon: <RiCodeSSlashLine /> }, { value: 'terminal', label: 'Terminal', icon: <RiTerminalBoxLine /> }]} />
      {tab === 'code' ? <AICodeBlock code={code} filename={file.split('/').pop()} highlightLines={highlightLines} /> : <AITerminal />}
    </div>
  </section>;
}

/* -------------------------------------------------------------------- Voice */

const TRANSCRIPT = 'Tạo một moodboard mới cho dự án SALA với tông xanh lá và gỗ sáng, thêm 6 ảnh tham khảo kiến trúc nhiệt đới.';

/** Speech input with a live level meter and a streaming transcription (simulated). */
export function AISpeechInput() {
  const [recording, setRecording] = useState(false);
  const [words, setWords] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const all = useMemo(() => TRANSCRIPT.split(' '), []);
  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => { setWords(value => Math.min(all.length, value + 1)); setSeconds(value => value + .25); }, 250);
    return () => window.clearInterval(id);
  }, [recording, all.length]);
  useEffect(() => { if (words >= all.length) setRecording(false); }, [words, all.length]);
  const toggle = () => { if (!recording && words >= all.length) { setWords(0); setSeconds(0); } setRecording(value => !value); };
  return <section className="ai-voice">
    <div className="ai-voice__row">
      <button type="button" className="ai-voice__mic" aria-pressed={recording} aria-label={recording ? 'Dừng ghi âm' : 'Bắt đầu nói'} onClick={toggle}>{recording ? <RiMicFill /> : <RiMicLine />}</button>
      <div className="ai-voice__wave" data-active={recording || undefined} aria-hidden="true">{Array.from({ length: 32 }, (_, index) => <i key={index} style={{ animationDelay: `${(index % 8) * 90}ms`, height: `${8 + ((index * 37) % 24)}px` }} />)}</div>
      <code>{`0:${String(Math.floor(seconds)).padStart(2, '0')}`}</code>
    </div>
    <p className="ai-voice__transcript" aria-live="polite">
      {words === 0 && !recording ? <span className="ai-voice__hint">Bấm micro và nói — chữ hiện ngay khi bạn nói.</span> : <>
        <span>{all.slice(0, Math.max(0, words - 3)).join(' ')} </span>
        <span className="ai-voice__interim">{all.slice(Math.max(0, words - 3), words).join(' ')}</span>
      </>}
    </p>
    <footer><span>{recording ? <AIShimmer>Đang nghe…</AIShimmer> : words >= all.length ? 'Đã chép xong' : 'Tiếng Việt · tự nhận dấu câu'}</span><VaultButton priority="primary" tone="brand" size="sm" disabled={recording || words === 0}>Gửi cho AI</VaultButton></footer>
  </section>;
}

/* ----------------------------------------------------------------- Workflow */

type WFNode = { id: string; x: number; y: number; title: string; kind: string; icon: ReactNode; status: 'done' | 'running' | 'idle'; body: string };
const NODE_W = 208;
const NODE_H = 128;

/** Agent workflow canvas: draggable nodes, bezier edges (animated while running), zoom controls. */
export function AIWorkflowCanvas() {
  const [nodes, setNodes] = useState<WFNode[]>([
    { id: 'n1', x: 32, y: 48, title: 'Nhận brief', kind: 'Trigger', icon: <RiMailSendLine />, status: 'done', body: 'Email khách hàng có tệp đính kèm' },
    { id: 'n2', x: 296, y: 140, title: 'Phân tích masterplan', kind: 'Agent', icon: <RiRobot2Line />, status: 'running', body: 'Claude Sonnet 5.5 · 3 công cụ' },
    { id: 'n3', x: 560, y: 40, title: 'Lưu vào Vault', kind: 'Action', icon: <RiDatabase2Line />, status: 'idle', body: 'Tạo board + 6 tài nguyên' },
    { id: 'n4', x: 560, y: 240, title: 'Báo Slack', kind: 'Action', icon: <RiFlowChart />, status: 'idle', body: '#sala-project' },
  ]);
  const edges = [['n1', 'n2'], ['n2', 'n3'], ['n2', 'n4']] as const;
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState('n2');
  const [hint, setHint] = useState(true);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const byId = (id: string) => nodes.find(node => node.id === id)!;
  const onDown = (event: ReactPointerEvent<HTMLDivElement>, node: WFNode) => {
    if ((event.target as HTMLElement).closest('button')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { id: node.id, dx: event.clientX / zoom - node.x, dy: event.clientY / zoom - node.y };
    setSelected(node.id);
  };
  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current; if (!d) return;
    const x = Math.round((event.clientX / zoom - d.dx) / 8) * 8;
    const y = Math.round((event.clientY / zoom - d.dy) / 8) * 8;
    setNodes(list => list.map(node => node.id === d.id ? { ...node, x: Math.max(0, x), y: Math.max(0, y) } : node));
  };
  return <section className="ai-flow" aria-label="Workflow agent">
    <div className="ai-flow__viewport" onPointerMove={onMove} onPointerUp={() => { drag.current = null; }}>
      <div className="ai-flow__world" style={{ transform: `scale(${zoom})` }}>
        <svg className="ai-flow__edges" width="1000" height="480" aria-hidden="true">
          {edges.map(([from, to]) => {
            const a = byId(from); const b = byId(to);
            const x1 = a.x + NODE_W; const y1 = a.y + NODE_H / 2; const x2 = b.x; const y2 = b.y + NODE_H / 2;
            const mid = (x1 + x2) / 2;
            return <path key={`${from}-${to}`} d={`M${x1} ${y1} C${mid} ${y1} ${mid} ${y2} ${x2} ${y2}`} data-animated={a.status === 'running' || b.status === 'running' || undefined} />;
          })}
        </svg>
        {nodes.map(node => <div key={node.id} className="ai-node" data-status={node.status} data-selected={node.id === selected || undefined} style={{ left: node.x, top: node.y, width: NODE_W, height: NODE_H }} onPointerDown={event => onDown(event, node)} role="group" aria-label={`${node.kind}: ${node.title}`}>
          <header><span className="ai-node__icon" aria-hidden="true">{node.icon}</span><span><small>{node.kind}</small><strong>{node.title}</strong></span></header>
          <p>{node.body}</p>
          <footer>{node.status === 'running' ? <AIShimmer>Đang chạy</AIShimmer> : node.status === 'done' ? <span className="ai-node__ok"><RiCheckLine aria-hidden="true" />Xong · 1.2s</span> : <span>Chờ</span>}</footer>
          <i className="ai-node__handle is-in" aria-hidden="true" /><i className="ai-node__handle is-out" aria-hidden="true" />
        </div>)}
      </div>
    </div>
    <div className="ai-flow__controls" role="group" aria-label="Điều khiển canvas">
      <button type="button" aria-label="Phóng to" disabled={zoom >= 1.25} onClick={() => setZoom(value => Math.min(1.25, +(value + .25).toFixed(2)))}><RiAddLine /></button>
      <button type="button" aria-label="Thu nhỏ" disabled={zoom <= .5} onClick={() => setZoom(value => Math.max(.5, +(value - .25).toFixed(2)))}><RiSubtractLine /></button>
      <button type="button" aria-label="Vừa khung" onClick={() => setZoom(1)}><RiFocus3Line /></button>
    </div>
    {hint && <div className="ai-flow__panel"><code>{Math.round(zoom * 100)}%</code><span>Kéo để sắp xếp</span><VaultButton appearance="text" size="sm" iconOnly icon={<RiCloseLine />} aria-label="Ẩn gợi ý" onClick={() => setHint(false)} /></div>}
  </section>;
}
