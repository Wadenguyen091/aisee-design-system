import { Fragment, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import {
  RiArrowDownSFill, RiArrowLeftSLine, RiArrowRightSLine, RiArrowUpLine, RiAttachment2, RiBookmarkLine, RiBrainLine,
  RiCheckboxBlankCircleLine, RiCheckboxCircleFill, RiCloseCircleFill, RiCloseLine, RiErrorWarningLine, RiFileCopyLine,
  RiFileTextLine, RiGlobalLine, RiImageLine, RiLoader4Line, RiRefreshLine, RiShieldCheckLine, RiSparkling2Fill,
  RiStopFill, RiChatNewLine, RiEditLine, RiThumbDownLine, RiThumbUpLine, RiTimeLine, RiToolsLine,
  RiArrowDownLine, RiFileList3Line, RiQuillPenLine, RiSearchLine, RiTaskLine, RiTranslate2, RiUploadCloud2Line,
} from '@remixicon/react';
import { VaultBadge, VaultButton, VaultField } from '../base/VaultControls';
import { VaultMenu, VaultMenuItem, VaultPopover, VaultPopoverSection } from '../base/VaultOverlays';
import { AI_FATAL_CODES, aiErrorCopy, estimateTokens, offlineTransport, useAITransport, type AIError, type AITier, type AITransport, type AIWireMessage } from './aiChatEngine';
import './ApplicationAI.css';

/*
 * AI interface components (Chatbot set), Vault edition.
 * Same language as the rest of Application: hairline frames, full-bleed rows, 4px grid,
 * tinted icon cells, one Primary per region. Everything is presentational + local state,
 * so a real model stream can be wired by passing text / status props.
 */

/* ------------------------------------------------------------------ Shimmer */

/** Animated text for "thinking" / loading labels. Static under reduced motion. */
export function AIShimmer({ children }: { children: ReactNode }) {
  return <span className="ai-shimmer">{children}</span>;
}

/* ----------------------------------------------------------------- Messages */

export type AISource = { id: number; title: string; domain: string };

/** Inline citation chip [n] with a hover / focus card. */
export function AIInlineCitation({ source }: { source: AISource }) {
  return <span className="ai-cite" tabIndex={0} aria-label={`Nguồn ${source.id}: ${source.title}`}>
    {source.id}
    <span className="ai-cite__card" role="tooltip"><strong>{source.title}</strong><small>{source.domain}</small></span>
  </span>;
}

/** Code fence inside an answer: language label + copy, monospace body. */
function AIFence({ lang, code }: { lang: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return <div className="ai-fence">
    <header><code>{lang || 'text'}</code><VaultButton appearance="text" size="sm" iconOnly icon={copied ? <RiCheckboxCircleFill /> : <RiFileCopyLine />} aria-label={copied ? 'Đã copy' : 'Copy code'} onClick={() => { void navigator.clipboard?.writeText(code).catch(() => undefined); setCopied(true); window.setTimeout(() => setCopied(false), 1400); }} /></header>
    <pre><code>{code}</code></pre>
  </div>;
}

type MdBlock = { kind: 'p' | 'h' | 'ul' | 'ol' | 'code' | 'quote' | 'table' | 'hr'; lines: string[]; lang?: string; level?: number; rows?: string[][] };

const tableCells = (row: string) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());

function parseMarkdown(text: string): MdBlock[] {
  const blocks: MdBlock[] = [];
  const rows = text.replace(/\r/g, '').split('\n');
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const fence = row.match(/^```\s*([\w+-]*)/);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < rows.length && !rows[i].startsWith('```')) { body.push(rows[i]); i += 1; }
      blocks.push({ kind: 'code', lang: fence[1], lines: body });
      continue;
    }
    if (!row.trim()) continue;
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(row)) { blocks.push({ kind: 'hr', lines: [] }); continue; }
    if (row.trim().startsWith('|') && /^\s*\|?\s*:?-{3,}/.test(rows[i + 1] ?? '')) {
      const table = [tableCells(row)];
      i += 2;
      while (i < rows.length && rows[i].trim().startsWith('|')) { table.push(tableCells(rows[i])); i += 1; }
      i -= 1;
      blocks.push({ kind: 'table', lines: [], rows: table });
      continue;
    }
    const quote = row.match(/^\s*>\s?(.*)/);
    if (quote) {
      const last = blocks.at(-1);
      if (last?.kind === 'quote' && rows[i - 1]?.trim().startsWith('>')) last.lines.push(quote[1]); else blocks.push({ kind: 'quote', lines: [quote[1]] });
      continue;
    }
    const heading = row.match(/^(#{1,3})\s+(.*)/);
    if (heading) { blocks.push({ kind: 'h', level: heading[1].length, lines: [heading[2]] }); continue; }
    const bullet = row.match(/^\s*[-*]\s+(.*)/);
    const ordered = row.match(/^\s*\d+[.)]\s+(.*)/);
    const kind = bullet ? 'ul' : ordered ? 'ol' : 'p';
    const content = bullet?.[1] ?? ordered?.[1] ?? row;
    const last = blocks.at(-1);
    if (last && last.kind === kind && (kind !== 'p' || (i > 0 && rows[i - 1].trim()))) last.lines.push(content);
    else blocks.push({ kind, lines: [content] });
  }
  return blocks;
}

/** Markdown for answers: paragraphs, ## headings, - / 1. lists, > quotes, | tables |, ---, ```code fences```, **bold**, *italic*, `code`, [link](url) and [n] citations. */
export function AIResponse({ text, sources = [], streaming = false }: { text: string; sources?: AISource[]; streaming?: boolean }) {
  const inline = (line: string, key: string) => line.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:[^)\s]+\)|\[\d+\]|\*[^*\s][^*]*\*)/g).filter(Boolean).map((part, index) => {
    const k = `${key}-${index}`;
    if (part.startsWith('**')) return <strong key={k}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`')) return <code key={k}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\((https?:[^)\s]+)\)$/);
    if (link) return <a key={k} href={link[2]} target="_blank" rel="noreferrer noopener">{link[1]}</a>;
    const cite = part.match(/^\[(\d+)\]$/);
    if (cite) { const source = sources.find(item => item.id === Number(cite[1])); return source ? <AIInlineCitation key={k} source={source} /> : part; }
    if (/^\*[^*]/.test(part) && part.endsWith('*')) return <em key={k}>{part.slice(1, -1)}</em>;
    return <Fragment key={k}>{part}</Fragment>;
  });
  const lines = (items: string[], key: string) => items.map((line, i) => <Fragment key={`${key}-${i}`}>{i > 0 && <br />}{inline(line, `${key}-${i}`)}</Fragment>);
  return <div className="ai-response" data-streaming={streaming || undefined}>
    {parseMarkdown(text).map((block, index) => {
      if (block.kind === 'code') return <AIFence key={index} lang={block.lang ?? ''} code={block.lines.join('\n')} />;
      if (block.kind === 'h') return <h4 key={index}>{inline(block.lines[0], String(index))}</h4>;
      if (block.kind === 'hr') return <hr key={index} />;
      if (block.kind === 'quote') return <blockquote key={index}>{lines(block.lines, String(index))}</blockquote>;
      if (block.kind === 'table' && block.rows) {
        const [head, ...body] = block.rows;
        return <div key={index} className="ai-table" role="region" aria-label="Bảng" tabIndex={0}><table>
          <thead><tr>{head.map((cell, i) => <th key={i} scope="col">{inline(cell, `${index}-h${i}`)}</th>)}</tr></thead>
          <tbody>{body.map((row, r) => <tr key={r}>{head.map((_, c) => <td key={c}>{inline(row[c] ?? '', `${index}-${r}-${c}`)}</td>)}</tr>)}</tbody>
        </table></div>;
      }
      if (block.kind === 'ul') return <ul key={index}>{block.lines.map((line, i) => <li key={i}>{inline(line, `${index}-${i}`)}</li>)}</ul>;
      if (block.kind === 'ol') return <ol key={index}>{block.lines.map((line, i) => <li key={i}>{inline(line, `${index}-${i}`)}</li>)}</ol>;
      return <p key={index}>{lines(block.lines, String(index))}</p>;
    })}
  </div>;
}

export const AI_FEEDBACK_REASONS = ['Sai thông tin', 'Không đúng ý', 'Quá dài', 'Thiếu chi tiết', 'Code không chạy'];
export type AIFeedbackValue = { vote: 'up' | 'down'; reasons: string[]; note: string };

/** Why an answer missed: reason chips (multi-select) + an optional note. Opens under the actions after 👎. */
export function AIFeedback({ onSubmit, onClose, reasons: options = AI_FEEDBACK_REASONS }: { onSubmit: (value: { reasons: string[]; note: string }) => void; onClose: () => void; reasons?: string[] }) {
  const [reasons, setReasons] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const toggle = (reason: string) => setReasons(list => list.includes(reason) ? list.filter(item => item !== reason) : [...list, reason]);
  return <section className="ai-feedback" aria-label="Góp ý câu trả lời">
    <header><strong>Câu trả lời chưa tốt ở đâu?</strong><VaultButton type="button" appearance="text" size="sm" iconOnly className="vault-close" icon={<RiCloseLine />} aria-label="Đóng góp ý" onClick={onClose} /></header>
    <div className="ai-feedback__reasons" role="group" aria-label="Lý do">
      {options.map(reason => <button type="button" key={reason} className="ai-suggestion" aria-pressed={reasons.includes(reason)} onClick={() => toggle(reason)}>{reasons.includes(reason) && <RiCheckboxCircleFill aria-hidden="true" />}{reason}</button>)}
    </div>
    <VaultField label="Góp ý thêm" placeholder="Góp ý thêm (không bắt buộc)" value={note} onChange={event => setNote(event.target.value)} />
    <footer>
      <VaultButton type="button" appearance="ghost" size="sm" onClick={onClose}>Bỏ qua</VaultButton>
      <VaultButton type="button" priority="primary" tone="brand" size="sm" disabled={!reasons.length && !note.trim()} onClick={() => onSubmit({ reasons, note: note.trim() })}>Gửi góp ý</VaultButton>
    </footer>
  </section>;
}

/** Actions under an assistant message, with an optional branch switcher (‹ 2 / 3 ›). 👎 opens AIFeedback. */
export function AIMessageActions({ text, branches, branch = 1, onBranch, onRetry, onFeedback, defaultVote = null, defaultFeedbackOpen = false }: {
  text: string;
  branches?: number;
  branch?: number;
  onBranch?: (value: number) => void;
  onRetry?: () => void;
  onFeedback?: (value: AIFeedbackValue) => void;
  defaultVote?: 'up' | 'down' | null;
  defaultFeedbackOpen?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [vote, setVote] = useState<'up' | 'down' | null>(defaultVote);
  const [feedback, setFeedback] = useState<'closed' | 'open' | 'sent'>(defaultFeedbackOpen ? 'open' : 'closed');
  const copy = () => { void navigator.clipboard?.writeText(text).catch(() => undefined); setCopied(true); window.setTimeout(() => setCopied(false), 1400); };
  const voteDown = () => {
    const next = vote === 'down' ? null : 'down';
    setVote(next);
    setFeedback(next ? 'open' : 'closed');
  };
  return <>
  <div className="ai-message__actions">
    {branches && branches > 1 && <span className="ai-branch" aria-label={`Phiên bản ${branch} / ${branches}`}>
      <VaultButton appearance="text" size="sm" iconOnly icon={<RiArrowLeftSLine />} aria-label="Phiên bản trước" disabled={branch <= 1} onClick={() => onBranch?.(branch - 1)} />
      <span>{branch} / {branches}</span>
      <VaultButton appearance="text" size="sm" iconOnly icon={<RiArrowRightSLine />} aria-label="Phiên bản sau" disabled={branch >= branches} onClick={() => onBranch?.(branch + 1)} />
    </span>}
    <VaultButton appearance="text" size="sm" iconOnly icon={copied ? <RiCheckboxCircleFill /> : <RiFileCopyLine />} aria-label={copied ? 'Đã copy' : 'Copy câu trả lời'} onClick={copy} />
    <VaultButton appearance="text" size="sm" iconOnly icon={<RiRefreshLine />} aria-label="Tạo lại" onClick={onRetry} />
    <VaultButton appearance="text" size="sm" iconOnly icon={<RiThumbUpLine />} aria-label="Hữu ích" aria-pressed={vote === 'up'} onClick={() => { const next = vote === 'up' ? null : 'up'; setVote(next); setFeedback('closed'); if (next) onFeedback?.({ vote: 'up', reasons: [], note: '' }); }} />
    <VaultButton appearance="text" size="sm" iconOnly icon={<RiThumbDownLine />} aria-label="Chưa tốt" aria-pressed={vote === 'down'} aria-expanded={feedback === 'open'} onClick={voteDown} />
    {feedback === 'sent' && <span className="ai-message__thanks" role="status">Đã ghi nhận góp ý</span>}
  </div>
  {feedback === 'open' && <AIFeedback onClose={() => setFeedback('closed')} onSubmit={value => { onFeedback?.({ vote: 'down', ...value }); setFeedback('sent'); }} />}
  </>;
}

/** Day divider in a conversation: a badge between hairlines. */
export function AIDaySeparator({ label }: { label: string }) {
  return <div className="ai-day vault-fade-rule" role="separator" aria-label={label}><VaultBadge>{label}</VaultBadge></div>;
}

export type AIMessageStatusKind = 'stopped' | 'error' | 'truncated' | 'note';
/** Status line under an answer: stopped / truncated / tier note are quiet captions; error is a tinted row with Retry. */
export function AIMessageStatus({ kind, children, onRetry, retryDisabled = false }: { kind: AIMessageStatusKind; children: ReactNode; onRetry?: () => void; retryDisabled?: boolean }) {
  if (kind === 'error') return <div className="ai-chat__error" role="alert"><RiErrorWarningLine aria-hidden="true" /><span>{children}</span>{onRetry && <VaultButton appearance="ghost" size="sm" icon={<RiRefreshLine />} disabled={retryDisabled} onClick={onRetry}>Thử lại</VaultButton>}</div>;
  return <p className="ai-chat__state" data-kind={kind}>{children}</p>;
}

/** Full-surface target shown while files are dragged over a chat. */
export function AIDropOverlay({ hint = 'Tối đa 4 tệp · văn bản ≤ 200 KB' }: { hint?: string }) {
  return <div className="ai-drop" aria-hidden="true">
    <span className="ai-drop__icon"><RiUploadCloud2Line /></span>
    <strong>Thả tệp để đính kèm</strong>
    <small>{hint}</small>
  </div>;
}

/**
 * One message. User = soft block aligned right; assistant = full-width with an identity cell. `meta` = badges beside the time
 * (e.g. "Đã sửa"). `avatar` replaces the Vault AI cell (e.g. an agent's identity avatar).
 */
export function AIMessage({ from, name, avatar, time, meta, children }: { from: 'user' | 'assistant'; name?: string; avatar?: ReactNode; time?: string; meta?: ReactNode; children: ReactNode }) {
  if (from === 'user') return <div className="ai-message is-user"><div className="ai-message__bubble">{children}</div>{(time || meta) && <footer className="ai-message__meta">{meta}{time && <small>{time}</small>}</footer>}</div>;
  return <div className="ai-message is-assistant">
    {avatar ? <span className="ai-message__identity" aria-hidden="true">{avatar}</span> : <span className="ai-message__avatar" aria-hidden="true"><RiSparkling2Fill /></span>}
    <div className="ai-message__body">
      <header><strong>{name ?? 'Vault AI'}</strong>{time && <small>{time}</small>}{meta}</header>
      {children}
    </div>
  </div>;
}

/** Scrollable message column with a jump-to-latest button. */
/** Scrollable message column. Scrolled up: a jump button; it says "Tin mới" when content arrived below. */
export function AIConversation({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const height = useRef(0);
  const [atBottom, setAtBottom] = useState(true);
  const [unseen, setUnseen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (atBottom) el.scrollTop = el.scrollHeight;
    else if (el.scrollHeight > height.current + 4 && !unseen) setUnseen(true);
    height.current = el.scrollHeight;
  });
  const jump = () => { const el = ref.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); };
  return <div className={`ai-conversation ${className}`.trim()}>
    <div ref={ref} className="ai-conversation__scroll" role="log" aria-live="polite" onScroll={event => { const el = event.currentTarget; const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 24; setAtBottom(bottom); if (bottom) setUnseen(false); }}>{children}</div>
    {!atBottom && (unseen
      ? <VaultButton appearance="ghost" size="sm" className="ai-conversation__jump" data-unseen="" icon={<RiArrowDownLine />} onClick={jump}>Tin mới</VaultButton>
      : <VaultButton appearance="ghost" size="sm" iconOnly className="ai-conversation__jump" icon={<RiArrowDownLine />} aria-label="Xuống tin nhắn mới nhất" onClick={jump} />)}
  </div>;
}

/* ---------------------------------------------------------- Reasoning, tool */

/** Collapsible reasoning. While streaming it shimmers; afterwards it shows the duration. */
export function AIReasoning({ text, seconds, streaming = false, defaultOpen = false }: { text: string; seconds?: number; streaming?: boolean; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return <div className="ai-reasoning" data-open={open || undefined}>
    <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>
      <RiBrainLine aria-hidden="true" />
      {streaming ? <AIShimmer>Đang suy nghĩ…</AIShimmer> : <span>Đã suy nghĩ trong {seconds ?? 0} giây</span>}
      <RiArrowDownSFill aria-hidden="true" className="ai-chevron" />
    </button>
    {open && <p id={id}>{text}</p>}
  </div>;
}

export type AIToolStatus = 'running' | 'done' | 'error' | 'awaiting';
const TOOL_STATUS: Record<AIToolStatus, { label: string; tone: 'info' | 'success' | 'danger' | 'warning' }> = {
  running: { label: 'Đang chạy', tone: 'info' }, done: { label: 'Hoàn tất', tone: 'success' }, error: { label: 'Lỗi', tone: 'danger' }, awaiting: { label: 'Chờ duyệt', tone: 'warning' },
};

/** Tool call: name, status, parameters and result in collapsible sections. `input` is optional (e.g. a sanitized activity with only a detail line). */
export function AITool({ name, status, input, output, error, defaultOpen = false }: { name: string; status: AIToolStatus; input?: Record<string, unknown>; output?: string; error?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className="ai-tool" data-status={status}>
    <button type="button" className="ai-tool__head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <span className="ai-tool__icon" aria-hidden="true">{status === 'running' ? <RiLoader4Line className="ai-spin" /> : <RiToolsLine />}</span>
      <code>{name}</code>
      <VaultBadge tone={TOOL_STATUS[status].tone}>{TOOL_STATUS[status].label}</VaultBadge>
      <RiArrowDownSFill aria-hidden="true" className="ai-chevron" />
    </button>
    {open && <div className="ai-tool__body">
      {input && <><span className="ai-label">Tham số</span>
      <pre>{JSON.stringify(input, null, 2)}</pre></>}
      {(output || error) && <><span className="ai-label">{error ? 'Lỗi' : 'Kết quả'}</span><pre data-error={error ? true : undefined}>{error ?? output}</pre></>}
    </div>}
  </section>;
}

export type AIConfirmationStatus = 'pending' | 'allowed' | 'denied' | 'expired';

/**
 * Approval gate before the agent performs a sensitive action. Uncontrolled (demo): local decision with Undo.
 * Controlled (`status`, e.g. a server approval): the decision comes from the server, there is no Undo, `busy`
 * locks both buttons while a decision is in flight, and `blocked` disables them with the reason shown. `children`
 * shows the exact action (command, path, diff) between the header and the buttons.
 */
export function AIConfirmation({ title, description, action = 'Cho phép', onDecide, status, busy = false, blocked, children }: {
  title: string; description: string; action?: string; onDecide?: (approved: boolean) => void;
  status?: AIConfirmationStatus; busy?: boolean; blocked?: string; children?: ReactNode;
}) {
  const [own, setOwn] = useState<boolean | null>(null);
  const controlled = status !== undefined;
  const decision: AIConfirmationStatus = controlled ? status : own === null ? 'pending' : own ? 'allowed' : 'denied';
  const locked = busy || !!blocked;
  const decide = (value: boolean) => { if (locked) return; if (!controlled) setOwn(value); onDecide?.(value); };
  const dataDecision = decision === 'pending' ? undefined : decision === 'allowed' ? 'approved' : decision;
  return <section className="ai-confirm" data-decision={dataDecision} aria-busy={busy || undefined}>
    <header>
      <span className="ai-confirm__icon" aria-hidden="true"><RiShieldCheckLine /></span>
      <div><strong>{title}</strong><small>{description}</small></div>
    </header>
    {children && <div className="ai-confirm__detail">{children}</div>}
    <footer>
      {decision === 'pending'
        ? <>{blocked && <small className="ai-confirm__reason">{blocked}</small>}<VaultButton appearance="ghost" size="sm" aria-disabled={locked || undefined} onClick={() => decide(false)}>Từ chối</VaultButton><VaultButton priority="primary" tone="brand" size="sm" loading={busy} aria-disabled={locked || undefined} onClick={() => decide(true)}>{action}</VaultButton></>
        : <span className="ai-confirm__result">{decision === 'allowed' ? <><RiCheckboxCircleFill aria-hidden="true" />Đã cho phép</> : decision === 'denied' ? <><RiCloseCircleFill aria-hidden="true" />Đã từ chối</> : <><RiTimeLine aria-hidden="true" />Đã hết hạn</>}{!controlled && <VaultButton appearance="text" size="sm" onClick={() => setOwn(null)}>Hoàn tác</VaultButton>}</span>}
    </footer>
  </section>;
}

/* ---------------------------------------------------------------- Plan, task */

export type AIPlanStep = { title: string; detail?: string; status: 'done' | 'active' | 'pending' | 'error' };

/** Plan / chain of thought: numbered steps with live status, collapsible. */
export function AIPlan({ title, steps, defaultOpen = true }: { title: string; steps: AIPlanStep[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const done = steps.filter(step => step.status === 'done').length;
  return <section className="ai-plan">
    <button type="button" className="ai-plan__head" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <strong>{title}</strong>
      <VaultBadge className="ai-plan__count">{`${done} / ${steps.length}`}</VaultBadge>
      <RiArrowDownSFill aria-hidden="true" className="ai-chevron" />
    </button>
    <span className="ai-plan__bar" aria-hidden="true"><i style={{ width: `${done / steps.length * 100}%` }} /></span>
    {open && <ol>{steps.map((step, index) => <li key={step.title} data-status={step.status}>
      <span className="ai-plan__mark" aria-hidden="true">{step.status === 'done' ? <RiCheckboxCircleFill /> : step.status === 'active' ? <RiLoader4Line className="ai-spin" /> : step.status === 'error' ? <RiErrorWarningLine /> : <RiCheckboxBlankCircleLine />}</span>
      <span className="ai-plan__copy"><strong>{step.status === 'active' ? <AIShimmer>{step.title}</AIShimmer> : step.title}</strong>{step.detail && <small>{step.detail}</small>}</span>
      <span className="sr-only">{step.status === 'done' ? 'xong' : step.status === 'active' ? 'đang làm' : step.status === 'error' ? 'lỗi' : 'chưa làm'}</span>
      <VaultBadge>{String(index + 1).padStart(2, '0')}</VaultBadge>
    </li>)}</ol>}
  </section>;
}

/* ------------------------------------------------------------------- Sources */

export function AISources({ sources, defaultOpen = false }: { sources: AISource[]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <section className="ai-sources">
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}>
      <RiGlobalLine aria-hidden="true" /><span>Dùng {sources.length} nguồn</span>
      <span className="ai-sources__stack" aria-hidden="true">{sources.slice(0, 3).map(source => <i key={source.id}>{source.domain[0].toUpperCase()}</i>)}</span>
      <RiArrowDownSFill aria-hidden="true" className="ai-chevron" />
    </button>
    {open && <ol>{sources.map(source => <li key={source.id}><code>{source.id}</code><span><strong>{source.title}</strong><small>{source.domain}</small></span></li>)}</ol>}
  </section>;
}

/* ------------------------------------------------------------- Small pieces */

export function AISuggestions({ items, onPick }: { items: string[]; onPick: (value: string) => void }) {
  return <div className="ai-suggestions" role="list" aria-label="Gợi ý">{items.map(item => <button role="listitem" type="button" key={item} className="ai-suggestion" onClick={() => onPick(item)}>{item}</button>)}</div>;
}

export function AICheckpoint({ time, onRestore }: { time: string; onRestore?: () => void }) {
  return <div className="ai-checkpoint" role="separator"><span><RiBookmarkLine aria-hidden="true" />Checkpoint · {time}</span><VaultButton appearance="text" size="sm" icon={<RiTimeLine />} onClick={onRestore}>Khôi phục</VaultButton></div>;
}

export type AIAttachment = { id: string; name: string; meta: string; kind: 'image' | 'file' };
export function AIAttachments({ items, onRemove }: { items: AIAttachment[]; onRemove?: (id: string) => void }) {
  if (!items.length) return null;
  return <div className="ai-attachments" role="list" aria-label="Tệp đính kèm">{items.map(item => <span role="listitem" className="ai-attachment" key={item.id}>
    <span className="ai-attachment__icon" aria-hidden="true">{item.kind === 'image' ? <RiImageLine /> : <RiFileTextLine />}</span>
    <span className="ai-attachment__copy"><strong>{item.name}</strong><small>{item.meta}</small></span>
    {onRemove && <VaultButton appearance="text" size="sm" iconOnly icon={<RiCloseLine />} aria-label={`Bỏ ${item.name}`} onClick={() => onRemove(item.id)} />}
  </span>)}</div>;
}

export function AIQueue({ items, onRemove }: { items: string[]; onRemove: (index: number) => void }) {
  if (!items.length) return null;
  return <section className="ai-queue" aria-label="Tin nhắn chờ gửi">
    <span className="ai-label">Hàng đợi · {items.length}</span>
    {items.map((item, index) => <div className="ai-queue__row" key={`${item}-${index}`}><VaultBadge>{index + 1}</VaultBadge><span>{item}</span><VaultButton appearance="text" size="sm" iconOnly icon={<RiCloseLine />} aria-label="Bỏ khỏi hàng đợi" onClick={() => onRemove(index)} /></div>)}
  </section>;
}

/* ---------------------------------------------------- Model + context meter */

export const AI_MODELS = [
  { id: 'opus', name: 'Claude Opus 5.5', hint: 'Phức tạp' },
  { id: 'sonnet', name: 'Claude Sonnet 5.5', hint: 'Cân bằng' },
  { id: 'haiku', name: 'Claude Haiku 5.5', hint: 'Nhanh' },
] as const;
export type AIModelId = (typeof AI_MODELS)[number]['id'];

export function AIModelSelector({ value, onChange }: { value: AIModelId; onChange: (value: AIModelId) => void }) {
  const [open, setOpen] = useState(false);
  const current = AI_MODELS.find(model => model.id === value) ?? AI_MODELS[1];
  return <VaultPopover
    open={open}
    onClose={() => setOpen(false)}
    placement="bottom-start"
    width={256}
    label="Chọn model"
    className="ai-model"
    trigger={<button type="button" className="ai-tool-chip" aria-label={`Model: ${current.name}`} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(v => !v)}><RiSparkling2Fill aria-hidden="true" /><span>{current.name}</span><RiArrowDownSFill aria-hidden="true" /></button>}
  >
    <VaultMenu label="Model">
      {AI_MODELS.map(model => <VaultMenuItem key={model.id} checked={model.id === value} hint={model.hint} onSelect={() => { onChange(model.id); setOpen(false); }}>{model.name}</VaultMenuItem>)}
    </VaultMenu>
  </VaultPopover>;
}

/** Context window usage: a ring meter with a breakdown popover. Pass `input`/`output` for a real split. */
export function AIContextMeter({ used, limit, input, output }: { used: number; limit: number; input?: number; output?: number }) {
  const [open, setOpen] = useState(false);
  const pct = Math.min(100, Math.round(used / limit * 100));
  const k = (value: number) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(Math.round(value));
  return <VaultPopover
    open={open}
    onClose={() => setOpen(false)}
    width={240}
    title="Ngữ cảnh"
    trigger={<button type="button" className="ai-context" aria-label={`Đã dùng ${pct}% ngữ cảnh`} aria-expanded={open} onClick={() => setOpen(v => !v)} style={{ '--ai-context': `${Math.max(pct, used ? 1 : 0) * 3.6}deg` } as CSSProperties}><i aria-hidden="true" /><span>{pct}%</span></button>}
  >
    <VaultPopoverSection>
      <dl className="ai-context__list">
        <div><dt>Đã dùng</dt><dd>{k(used)} / {k(limit)}</dd></div>
        <div><dt>Tin nhắn của bạn</dt><dd>{k(input ?? used * .8)}</dd></div>
        <div><dt>Câu trả lời</dt><dd>{k(output ?? used * .2)}</dd></div>
        <div><dt>Cách tính</dt><dd>≈ 4 ký tự / token</dd></div>
      </dl>
    </VaultPopoverSection>
  </VaultPopover>;
}

/* ------------------------------------------------------------ Slash commands */

export type AISlashCommand = { id: string; label: string; trigger: string; template: string; icon: ReactNode };
export const AI_SLASH_COMMANDS: AISlashCommand[] = [
  { id: 'summary', label: 'Tóm tắt cuộc trò chuyện', trigger: 'tomtat', template: 'Tóm tắt cuộc trò chuyện này thành 5 ý chính.', icon: <RiFileList3Line /> },
  { id: 'brief', label: 'Viết brief cho dev', trigger: 'brief', template: 'Viết brief ngắn cho dev về ', icon: <RiQuillPenLine /> },
  { id: 'task', label: 'Tạo task', trigger: 'task', template: 'Tạo task "" cho VA-024', icon: <RiTaskLine /> },
  { id: 'find', label: 'Tìm dự án', trigger: 'duan', template: 'Dự án nào đang Review?', icon: <RiSearchLine /> },
  { id: 'translate', label: 'Dịch sang tiếng Anh', trigger: 'dich', template: 'Dịch sang tiếng Anh: ', icon: <RiTranslate2 /> },
];
const fold = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();
/** Commands matching what follows "/" (accent-insensitive, by trigger or label). */
export const matchSlash = (text: string, commands: AISlashCommand[] = AI_SLASH_COMMANDS) => {
  const query = text.match(/^\/(\S*)$/)?.[1];
  if (query === undefined) return null;
  const needle = fold(query);
  return commands.filter(command => !needle || fold(command.trigger).startsWith(needle) || fold(command.label).includes(needle));
};

/** The "/" menu above the prompt: 40 rows (icon fill, label, /trigger hint); the highlighted row follows ↑ ↓. */
export function AISlashMenu({ commands, active, onPick, onHover }: { commands: AISlashCommand[]; active: number; onPick: (command: AISlashCommand) => void; onHover?: (index: number) => void }) {
  return <div className="ai-slash" id="ai-slash-menu">
    <VaultMenu label="Lệnh nhanh">
      {commands.length
        ? commands.map((command, index) => <div key={command.id} onPointerEnter={() => onHover?.(index)}><VaultMenuItem icon={command.icon} hint={`/${command.trigger}`} className={index === active ? 'is-active' : ''} onSelect={() => onPick(command)}>{command.label}</VaultMenuItem></div>)
        : <p className="ai-slash__empty">Không có lệnh khớp</p>}
    </VaultMenu>
  </div>;
}

/* -------------------------------------------------------------- Prompt input */

export function AIPromptInput({ status, onSubmit, onStop, model, onModel, modelSlot, variant = 'box', sendLabel = 'Gửi', attachments, onAttach, onRemoveAttachment, web, onWeb, used = 0, limit = 200000, usedInput, usedOutput, placeholder = 'Hỏi Vault AI… gõ / để xem lệnh', value, onValueChange, toolsOn, onTools, onNewChat, connection, onEscape, onRecall, inputRef, slashCommands = AI_SLASH_COMMANDS, onPasteFiles, leading, sendBlocked, stopBlocked, hint }: {
  status: 'idle' | 'streaming';
  onSubmit: (text: string) => void;
  onStop: () => void;
  model: AIModelId;
  onModel: (value: AIModelId) => void;
  /** Replaces the model selector, e.g. the gateway's route chip when the model is set by policy. */
  modelSlot?: ReactNode;
  /** box = framed input with a tool footer · bar = one full-bleed row: text + a Send cell (no tools). */
  variant?: 'box' | 'bar';
  sendLabel?: string;
  attachments: AIAttachment[];
  onAttach: () => void;
  onRemoveAttachment: (id: string) => void;
  /** Legacy web toggle (demo only). Prefer `toolsOn` / `onTools`. */
  web?: boolean;
  onWeb?: (value: boolean) => void;
  used?: number;
  limit?: number;
  usedInput?: number;
  usedOutput?: number;
  placeholder?: string;
  /** Controlled text (optional). */
  value?: string;
  onValueChange?: (value: string) => void;
  toolsOn?: boolean;
  onTools?: (value: boolean) => void;
  onNewChat?: () => void;
  /** Connection chip (e.g. "Claude" / "Mô phỏng"). */
  connection?: ReactNode;
  onEscape?: () => void;
  /** ArrowUp in an empty box: recall the last message for editing. */
  onRecall?: () => void;
  inputRef?: { current: HTMLTextAreaElement | null };
  /** Commands offered when the box starts with "/". Pass [] to turn the menu off. */
  slashCommands?: AISlashCommand[];
  /** Files pasted into the box (e.g. a screenshot). */
  onPasteFiles?: (files: File[]) => void;
  /** Bar only: a full-height cell before the text (e.g. "Task"), mirroring the Send cell. */
  leading?: ReactNode;
  /** Why sending is not possible right now: Send is disabled (the text stays) and the reason is its title. */
  sendBlocked?: string;
  /** Why the running answer cannot be stopped (e.g. the connection does not support cancel): Stop is disabled. */
  stopBlocked?: string;
  /** One quiet caption line above the box (e.g. the reason a control is disabled). */
  hint?: ReactNode;
}) {
  const [own, setOwn] = useState('');
  const text = value ?? own;
  const setText = (next: string) => { if (onValueChange) onValueChange(next); else setOwn(next); };
  const streaming = status === 'streaming';
  const ownRef = useRef<HTMLTextAreaElement | null>(null);
  const [slashActive, setSlashActive] = useState(0);
  const [slashDismissed, setSlashDismissed] = useState('');
  const slash = slashCommands.length && slashDismissed !== text ? matchSlash(text, slashCommands) : null;
  useEffect(() => { setSlashActive(0); }, [text]);
  const pick = (command: AISlashCommand) => {
    setText(command.template);
    window.requestAnimationFrame(() => {
      const el = ownRef.current;
      if (!el) return;
      el.focus();
      const quote = command.template.indexOf('""');
      const at = quote >= 0 ? quote + 1 : command.template.length;
      el.setSelectionRange(at, at);
    });
  };
  const send = () => { const v = text.trim(); if ((!v && !attachments.length) || sendBlocked) return; onSubmit(v); setText(''); };
  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (slash && !event.nativeEvent.isComposing) {
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); if (slash.length) setSlashActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + slash.length) % slash.length); return; }
      if ((event.key === 'Enter' || event.key === 'Tab') && slash.length) { event.preventDefault(); pick(slash[Math.min(slashActive, slash.length - 1)]); return; }
      if (event.key === 'Escape') { event.preventDefault(); setSlashDismissed(text); return; }
    }
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
    else if (event.key === 'Escape' && streaming) { event.preventDefault(); onEscape?.(); }
    else if (event.key === 'ArrowUp' && !text && onRecall) { event.preventDefault(); onRecall(); }
  };
  return <form className="ai-prompt" data-variant={variant} data-lead={variant === 'bar' && leading ? true : undefined} data-hint={hint ? true : undefined} onSubmit={event => { event.preventDefault(); send(); }}>
    {hint && <p className="ai-prompt__hint" role="status">{hint}</p>}
    {slash && <AISlashMenu commands={slash} active={slashActive} onPick={pick} onHover={setSlashActive} />}
    <AIAttachments items={attachments} onRemove={onRemoveAttachment} />
    {variant === 'bar' && leading && <div className="ai-prompt__leads">{leading}</div>}
    <textarea
      ref={node => { ownRef.current = node; if (inputRef) inputRef.current = node; }}
      value={text}
      onChange={event => setText(event.target.value)}
      onKeyDown={onKeyDown}
      onPaste={event => { const files = Array.from(event.clipboardData.files); if (files.length && onPasteFiles) { event.preventDefault(); onPasteFiles(files); } }}
      placeholder={streaming && !sendBlocked ? 'Nhắn tiếp…' : placeholder}
      rows={variant === 'bar' ? 1 : 2}
      aria-label="Nội dung tin nhắn"
      aria-expanded={slash ? true : undefined}
      aria-controls={slash ? 'ai-slash-menu' : undefined}
      aria-autocomplete={slashCommands.length ? 'list' : undefined}
    />
    {variant === 'bar' ? (streaming
      ? <VaultButton type="button" appearance="soft" icon={<RiStopFill />} aria-disabled={stopBlocked ? true : undefined} title={stopBlocked} onClick={stopBlocked ? undefined : onStop} className="ai-prompt__cell">Dừng</VaultButton>
      : <VaultButton type="submit" priority="primary" tone="brand" icon={<RiArrowUpLine />} aria-disabled={(!text.trim() && !attachments.length) || !!sendBlocked} title={sendBlocked} className="ai-prompt__cell">{sendLabel}</VaultButton>)
    : <footer>
      <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiAttachment2 />} aria-label="Đính kèm tệp" onClick={onAttach} />
      {onTools
        ? <button type="button" className="ai-tool-chip" aria-label="Công cụ Vault" aria-pressed={!!toolsOn} title="Cho phép AI tìm dự án và tạo task trong Vault" onClick={() => onTools(!toolsOn)}><RiToolsLine aria-hidden="true" /><span>Công cụ Vault</span></button>
        : onWeb && <button type="button" className="ai-tool-chip" aria-label="Tìm web" aria-pressed={!!web} onClick={() => onWeb(!web)}><RiGlobalLine aria-hidden="true" /><span>Tìm web</span></button>}
      {modelSlot ?? <AIModelSelector value={model} onChange={onModel} />}
      {onNewChat && <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiChatNewLine />} aria-label="Cuộc trò chuyện mới" title="Cuộc trò chuyện mới" onClick={onNewChat} />}
      <span className="ai-prompt__spacer" />
      {connection}
      <AIContextMeter used={used} limit={limit} input={usedInput} output={usedOutput} />
      {streaming
        ? <VaultButton type="button" appearance="soft" size="sm" iconOnly icon={<RiStopFill />} aria-label="Dừng tạo" onClick={onStop} className="ai-prompt__send" />
        : <VaultButton type="submit" priority="primary" tone="brand" size="sm" iconOnly icon={<RiArrowUpLine />} aria-label="Gửi" disabled={!text.trim() && !attachments.length} className="ai-prompt__send" />}
    </footer>}
  </form>;
}

/* ---------------------------------------------------------------------- Chat */

type ToolCard = { id: string; name: string; status: AIToolStatus; input: Record<string, unknown>; output?: string; error?: string };
type ReplyVersion = { text: string; status: 'streaming' | 'done' | 'stopped' | 'error'; error?: string; errorCode?: string; tools: ToolCard[]; waitMs?: number; truncated?: boolean; tierNote?: string; meta?: string[]; data?: unknown };
type ChatAttachment = AIAttachment & { text?: string; file?: File };
type ChatMessage =
  | { id: string; role: 'user'; text: string; time: string; at?: number; edited?: boolean; attachments?: AIAttachment[]; wire?: string }
  | { id: string; role: 'assistant'; time: string; at?: number; versions: ReplyVersion[]; active: number };
/** Stored chat message (also used to seed demo conversations). */
export type AIChatMessage = ChatMessage;
export type AIChatSummary = { title: string; count: number; updatedAt: number; preview: string };

export const AI_CHAT_STORE = 'vault-ai-chat-v1';
const CHAT_STORE = AI_CHAT_STORE;
const TIER: Record<AIModelId, AITier> = { opus: 'complex', sonnet: 'default', haiku: 'quick' };
const TIER_NAME: Record<AITier, string> = { complex: 'Opus', default: 'Sonnet', quick: 'Haiku' };
const STARTERS = ['Dự án nào đang Review?', 'Tạo task "Chốt bản đồ" cho VA-024', 'Viết brief ngắn cho dev về bản đồ tương tác', 'Ví dụ component React dùng VaultSheet'];
const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const clock = () => new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const sizeLabel = (bytes: number) => bytes > 1048576 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** Day label for a timestamp: Hôm nay, Hôm qua, or dd/mm. */
export function aiDayLabel(at: number, now = Date.now()) {
  const day = (value: number) => { const d = new Date(value); return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  const diff = Math.round((day(now) - day(at)) / 86400000);
  return diff === 0 ? 'Hôm nay' : diff === 1 ? 'Hôm qua' : new Date(at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
}

/** Plain-text view of a stored conversation (title, count, preview) — what history lists show. */
export function summarizeChat(messages: ChatMessage[]): AIChatSummary {
  const firstUser = messages.find(message => message.role === 'user');
  const last = messages.at(-1);
  const lastText = last ? last.role === 'user' ? last.text : last.versions[last.active]?.text ?? '' : '';
  const clean = (value: string) => value.replace(/[#*`>|_\[\]]/g, '').replace(/\s+/g, ' ').trim();
  const title = clean(firstUser?.role === 'user' ? firstUser.text : '') || 'Cuộc trò chuyện mới';
  return { title: title.length > 48 ? `${title.slice(0, 47)}…` : title, count: messages.length, updatedAt: Math.max(0, ...messages.map(message => message.at ?? 0)), preview: clean(lastText).slice(0, 80) };
}

/** Conversation as Markdown, for export. */
export function chatToMarkdown(title: string, messages: ChatMessage[]) {
  const parts = [`# ${title}`, ''];
  for (const message of messages) {
    if (message.role === 'user') parts.push(`**Bạn** · ${message.time}`, '', message.text, '');
    else { const version = message.versions[message.active]; if (version?.text) parts.push(`**Vault AI** · ${message.time}`, '', version.text, ''); }
  }
  return parts.join('\n');
}

export function loadChat(store = CHAT_STORE): ChatMessage[] {
  try {
    const raw = window.localStorage.getItem(store);
    const list = raw ? JSON.parse(raw) as ChatMessage[] : [];
    return Array.isArray(list) ? list.map(message => message.role === 'assistant'
      ? { ...message, versions: message.versions.map(version => version.status === 'streaming' ? { ...version, status: 'stopped' as const } : version) }
      : message) : [];
  } catch { return []; }
}

/**
 * Vault AI chat — a working chat, not a mock-up. Talks to Claude through the claude.ai
 * artifact runtime when available (consent on first send), otherwise to a local simulator.
 * Send · stream · Stop (button / Esc) · queue while answering · regenerate with versions ·
 * edit a sent message (↑ recalls the last one) · attach text files / images · Vault tools
 * (search projects, create task) · errors with retry · new chat · history kept in this browser.
 */
export function AIChat({ storeKey = CHAT_STORE, onUpdate, onNewChat, starters = STARTERS, assistant, wrapTransport, modelSlot, renderData, onStatus, placeholder, layout = 'panel', look = 'default', composer = 'box', sendLabel, slashCommands, autoSend, composerLeading, className = '' }: {
  /** localStorage key of this conversation (one per thread in Cổng AI). */
  storeKey?: string;
  /** Called after every change with a plain summary (title, count, last activity). */
  onUpdate?: (summary: AIChatSummary) => void;
  /** Replaces the built-in reset (the workspace opens a new thread instead). */
  onNewChat?: () => void;
  starters?: string[];
  /** Who answers: name, avatar and the empty-state line. Defaults to Vault AI. */
  assistant?: { name: string; avatar?: ReactNode; intro?: ReactNode };
  /** Wraps the resolved transport (Claude or offline), e.g. to route every turn through the AI gateway. */
  wrapTransport?: (base: AITransport) => AITransport;
  /** Replaces the model selector in the prompt footer. */
  modelSlot?: ReactNode;
  /** Renders data a transport attached to a reply (`onData`), above the answer. */
  renderData?: (data: unknown, streaming: boolean) => ReactNode;
  /** Fires when the chat starts or finishes answering. */
  onStatus?: (status: 'idle' | 'streaming') => void;
  placeholder?: string;
  /** panel = framed block (DS page, workspace); page = fills its parent, reading column centred, prompt docked full-bleed. */
  layout?: 'panel' | 'page';
  /** default = assistant rows with identity + head · bubble = conversation bubbles, no heads (VEX-style agent chat). */
  look?: 'default' | 'bubble';
  /** box = framed prompt with tools · bar = full-bleed row with a Send cell. */
  composer?: 'box' | 'bar';
  sendLabel?: string;
  /** Commands offered after "/" (defaults to the Vault AI set). */
  slashCommands?: AISlashCommand[];
  /** Sends `text` once per `id` (e.g. a scripted test step); queued if the chat is answering. */
  autoSend?: { id: string; text: string };
  /** Bar composer: a cell before the text, e.g. the gateway's "Task" action. */
  /** Cell before the bar composer's input. A function gets the current draft and a way to clear it (e.g. Task turns what you typed into a task). */
  composerLeading?: ReactNode | ((composer: { draft: string; clear: () => void }) => ReactNode);
  className?: string;
} = {}) {
  const { transport: resolved, status: link } = useAITransport();
  const [forcedOffline, setForcedOffline] = useState(false);
  const base = forcedOffline ? offlineTransport : resolved;
  const transport = useMemo(() => wrapTransport ? wrapTransport(base) : base, [base, wrapTransport]);
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadChat(storeKey));
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const updateRef = useRef(onUpdate);
  updateRef.current = onUpdate;
  const [model, setModel] = useState<AIModelId>('sonnet');
  const [toolsOn, setToolsOn] = useState(true);
  const [draft, setDraft] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [queue, setQueue] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const controller = useRef<AbortController | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    try { window.localStorage.setItem(storeKey, JSON.stringify(messages.map(message => message.role === 'user' ? { ...message, attachments: message.attachments?.map(({ id, name, meta, kind }) => ({ id, name, meta, kind })) } : message))); } catch { /* storage unavailable */ }
    updateRef.current?.(summarizeChat(messages));
  }, [messages, storeKey]);
  useEffect(() => () => controller.current?.abort(), []);
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;
  useEffect(() => { statusRef.current?.(busy ? 'streaming' : 'idle'); }, [busy]);

  const patchVersion = (id: string, index: number, patch: (version: ReplyVersion) => ReplyVersion) =>
    setMessages(list => list.map(message => message.id === id && message.role === 'assistant'
      ? { ...message, versions: message.versions.map((version, i) => i === index ? patch(version) : version) } : message));

  /** Wire history up to (and including) the user turn before `assistantId`. */
  const history = (list: ChatMessage[], assistantId: string): AIWireMessage[] => {
    const cut = list.findIndex(message => message.id === assistantId);
    const wire: AIWireMessage[] = [];
    for (const message of list.slice(0, cut)) {
      if (message.role === 'user') wire.push({ role: 'user', content: message.wire ?? message.text });
      else { const version = message.versions[message.active]; if (version?.text.trim()) wire.push({ role: 'assistant', content: version.text }); }
    }
    let size = wire.reduce((total, turn) => total + turn.content.length, 0);
    while (size > 180000 && wire.length > 1) { size -= wire.shift()!.content.length; }
    while (wire.length && wire[0].role !== 'user') wire.shift();
    return wire;
  };

  const run = async (assistantId: string, index: number, images: File[] = [], list = messagesRef.current) => {
    const ctl = new AbortController();
    controller.current = ctl;
    setBusy(true);
    setNotice(null);
    const started = performance.now();
    let first = true;
    let partial = '';
    try {
      const result = await transport.send(history(list, assistantId), {
        tier: TIER[model],
        signal: ctl.signal,
        images,
        tools: toolsOn,
        onText: text => {
          partial = text;
          const waitMs = first ? Math.round(performance.now() - started) : undefined;
          first = false;
          patchVersion(assistantId, index, version => ({ ...version, text, ...(waitMs !== undefined ? { waitMs } : {}) }));
        },
        onData: data => patchVersion(assistantId, index, version => ({ ...version, data })),
        onTool: event => patchVersion(assistantId, index, version => event.phase === 'start'
          ? { ...version, tools: [...version.tools, { id: event.id, name: event.name, status: 'running', input: event.input }] }
          : { ...version, tools: version.tools.map(tool => tool.id === event.id ? { ...tool, status: event.error ? 'error' : 'done', output: event.output, error: event.error } : tool) }),
      });
      const tierNote = result.note ?? (result.tierApplied && result.tierApplied !== TIER[model] ? `Trả lời bởi ${TIER_NAME[result.tierApplied]} (gói hiện tại không dùng được ${TIER_NAME[TIER[model]]})` : undefined);
      patchVersion(assistantId, index, version => ({ ...version, text: result.text, status: 'done', truncated: result.truncated, tierNote, meta: result.meta }));
    } catch (raw) {
      const error = (raw ?? {}) as Partial<AIError>;
      const code = ctl.signal.aborted ? 'cancelled' : error.code ?? 'upstream_error';
      const kept = error.text ?? partial;
      if (code === 'cancelled') patchVersion(assistantId, index, version => ({ ...version, text: kept, status: 'stopped', tools: version.tools.map(tool => tool.status === 'running' ? { ...tool, status: 'error', error: 'Đã dừng' } : tool) }));
      else {
        if (code === 'refused') patchVersion(assistantId, index, version => ({ ...version, text: '' }));
        patchVersion(assistantId, index, version => ({ ...version, text: code === 'refused' ? '' : kept, status: 'error', error: aiErrorCopy(code, error.message), errorCode: code }));
        if (AI_FATAL_CODES.has(code)) setForcedOffline(true);
      }
    } finally {
      if (controller.current === ctl) controller.current = null;
      setBusy(false);
    }
  };

  const send = async (text: string, files: ChatAttachment[] = attachments) => {
    if (busy) { if (text) setQueue(list => [...list, text]); return; }
    const docs = files.filter(file => file.text !== undefined);
    const images = files.filter(file => file.kind === 'image' && file.file).map(file => file.file!);
    const wire = [text || 'Xem tệp đính kèm.', ...docs.map(doc => `\n\n[Tệp đính kèm: ${doc.name}]\n\`\`\`\n${doc.text}\n\`\`\``), ...(images.length && !transport.canImages ? [`\n\n(Người dùng đính kèm ${images.length} ảnh nhưng trang này không gửi được ảnh.)`] : [])].join('');
    const now = Date.now();
    const user: ChatMessage = { id: uid(), role: 'user', text: text || `${files.length} tệp đính kèm`, time: clock(), at: now, attachments: files.map(({ id, name, meta, kind }) => ({ id, name, meta, kind })), wire };
    const reply: ChatMessage = { id: uid(), role: 'assistant', time: clock(), at: now, versions: [{ text: '', status: 'streaming', tools: [] }], active: 0 };
    const next = [...messagesRef.current, user, reply];
    setMessages(next);
    setAttachments([]);
    await run(reply.id, 0, transport.canImages ? images : [], next);
  };

  // A scripted message (test run): sent once per id.
  const autoSent = useRef<string | null>(null);
  useEffect(() => {
    if (!autoSend || autoSent.current === autoSend.id) return;
    autoSent.current = autoSend.id;
    void send(autoSend.text, []);
  }, [autoSend?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drain the queue one message at a time once the current answer settles.
  useEffect(() => {
    if (busy || !queue.length) return;
    const [head, ...rest] = queue;
    setQueue(rest);
    void send(head, []);
  }, [busy, queue]); // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => controller.current?.abort();

  const regenerate = (assistantId: string) => {
    if (busy) return;
    const list = messagesRef.current;
    const target = list.find(message => message.id === assistantId);
    if (!target || target.role !== 'assistant') return;
    const index = target.versions.length;
    const next = list.map(message => message.id === assistantId && message.role === 'assistant' ? { ...message, versions: [...message.versions, { text: '', status: 'streaming' as const, tools: [] }], active: index } : message);
    setMessages(next);
    void run(assistantId, index, [], next);
  };

  const saveEdit = () => {
    if (!editing || busy) return;
    const text = editing.text.trim();
    if (!text) return;
    const list = messagesRef.current;
    const at = list.findIndex(message => message.id === editing.id);
    if (at < 0) return;
    const original = list[at];
    const kept = original.role === 'user' && original.wire && original.wire !== original.text ? original.wire.slice(original.text.length) : '';
    const user: ChatMessage = { ...(original as Extract<ChatMessage, { role: 'user' }>), text, wire: text + kept, time: clock(), at: Date.now(), edited: true };
    const reply: ChatMessage = { id: uid(), role: 'assistant', time: clock(), at: Date.now(), versions: [{ text: '', status: 'streaming', tools: [] }], active: 0 };
    const next = [...list.slice(0, at), user, reply];
    setEditing(null);
    setMessages(next);
    void run(reply.id, 0, [], next);
  };

  const recall = () => {
    const last = [...messagesRef.current].reverse().find(message => message.role === 'user');
    if (last && last.role === 'user' && !busy) setEditing({ id: last.id, text: last.text });
  };

  const pickFiles = async (list: FileList | File[] | null) => {
    if (!list) return;
    const picked: ChatAttachment[] = [];
    for (const file of Array.from(list).slice(0, 4)) {
      const isImage = file.type.startsWith('image/');
      if (isImage) { picked.push({ id: uid(), name: file.name, meta: `Ảnh · ${sizeLabel(file.size)}${transport.canImages ? '' : ' · không gửi được'}`, kind: 'image', file }); continue; }
      if (file.size > 200 * 1024) { setNotice(`${file.name} lớn hơn 200 KB nên chưa đính kèm được.`); continue; }
      const text = await file.text().catch(() => '');
      picked.push({ id: uid(), name: file.name, meta: `${file.name.split('.').pop()?.toUpperCase() ?? 'TXT'} · ${sizeLabel(file.size)}`, kind: 'file', text });
    }
    setAttachments(current => [...current, ...picked].slice(0, 4));
    if (fileInput.current) fileInput.current.value = '';
  };

  const reset = () => { if (onNewChat) { onNewChat(); return; } stop(); setMessages([]); setQueue([]); setAttachments([]); setEditing(null); setNotice(null); window.setTimeout(() => textarea.current?.focus(), 0); };
  const hasFiles = (event: React.DragEvent) => Array.from(event.dataTransfer.types).includes('Files');

  const inputTokens = messages.reduce((total, message) => total + (message.role === 'user' ? estimateTokens(message.wire ?? message.text) : 0), 0);
  const outputTokens = messages.reduce((total, message) => total + (message.role === 'assistant' ? estimateTokens(message.versions[message.active]?.text ?? '') : 0), 0);
  const live = transport.kind === 'claude';

  return <section
    className={`ai-chat ${className}`.trim()}
    aria-label={assistant?.name ?? 'Vault AI'}
    data-layout={layout}
    data-look={look}
    data-empty={!messages.length || undefined}
    data-dragging={dragging || undefined}
    onDragEnter={event => { if (!hasFiles(event)) return; event.preventDefault(); dragDepth.current += 1; setDragging(true); }}
    onDragOver={event => { if (hasFiles(event)) event.preventDefault(); }}
    onDragLeave={() => { dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); }}
    onDrop={event => { if (!hasFiles(event)) return; event.preventDefault(); dragDepth.current = 0; setDragging(false); void pickFiles(event.dataTransfer.files); }}
  >
    {dragging && <AIDropOverlay />}
    {notice && <div className="ai-chat__notice" role="status"><RiErrorWarningLine aria-hidden="true" /><span>{notice}</span><VaultButton appearance="text" size="sm" iconOnly icon={<RiCloseLine />} aria-label="Đóng thông báo" className="vault-close" onClick={() => setNotice(null)} /></div>}
    {messages.length === 0
      ? <div className="ai-chat__empty">
        {assistant?.avatar ? <span className="ai-chat__identity" aria-hidden="true">{assistant.avatar}</span> : <span className="ai-message__avatar" aria-hidden="true"><RiSparkling2Fill /></span>}
        <strong>{assistant?.name ?? 'Vault AI'}</strong>
        <p>{assistant?.intro ?? (live ? 'Đang kết nối Claude. Hỏi về dự án, nhờ viết brief hoặc tạo task.' : 'Chế độ mô phỏng: câu trả lời tạo cục bộ để test giao diện. Mở trong claude.ai để chat với Claude thật.')}</p>
        <AISuggestions items={starters} onPick={value => void send(value, [])} />
      </div>
      : <AIConversation>
        {messages.map((message, position) => {
          const previous = messages[position - 1];
          const day = message.at && (!previous?.at || aiDayLabel(previous.at) !== aiDayLabel(message.at)) ? <AIDaySeparator key={`day-${message.id}`} label={aiDayLabel(message.at)} /> : null;
          if (message.role === 'user') {
            const isEditing = editing?.id === message.id;
            return <Fragment key={message.id}>{day}<div className="ai-chat__user" data-editing={isEditing || undefined}>
              {isEditing
                ? <form className="ai-edit" onSubmit={event => { event.preventDefault(); saveEdit(); }}>
                  <textarea autoFocus value={editing.text} onChange={event => setEditing({ id: message.id, text: event.target.value })} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); saveEdit(); } if (event.key === 'Escape') setEditing(null); }} aria-label="Sửa tin nhắn" rows={2} />
                  <footer><VaultButton type="button" appearance="ghost" size="sm" onClick={() => setEditing(null)}>Hủy</VaultButton><VaultButton type="submit" priority="primary" tone="brand" size="sm" disabled={busy || !editing.text.trim()}>Gửi lại</VaultButton></footer>
                </form>
                : <AIMessage from="user" time={message.time} meta={message.edited ? <VaultBadge>Đã sửa</VaultBadge> : undefined}>
                  {message.attachments?.length ? <AIAttachments items={message.attachments} /> : null}
                  {message.text}
                </AIMessage>}
              {!isEditing && !busy && <VaultButton appearance="text" size="sm" iconOnly className="ai-chat__edit" icon={<RiEditLine />} aria-label="Sửa tin nhắn" onClick={() => setEditing({ id: message.id, text: message.text })} />}
            </div></Fragment>;
          }
          const version = message.versions[message.active];
          const waiting = version.status === 'streaming' && !version.text;
          const isLast = position === messages.length - 1;
          const badges = version.status === 'streaming' ? [] : [...(version.waitMs !== undefined ? [`${(version.waitMs / 1000).toFixed(1)}s`] : []), ...(version.meta ?? [])];
          return <Fragment key={message.id}>{day}<AIMessage from="assistant" name={assistant?.name} avatar={assistant?.avatar} time={message.time} meta={badges.length ? <>{badges.map(badge => <VaultBadge key={badge}>{badge}</VaultBadge>)}</> : undefined}>
            {version.data !== undefined && renderData?.(version.data, version.status === 'streaming')}
            {version.tools.map(tool => <AITool key={tool.id} name={tool.name} status={tool.status} input={tool.input} output={tool.output} error={tool.error} />)}
            {waiting ? <AIReasoning streaming text="" /> : version.text ? <AIResponse text={version.text} streaming={version.status === 'streaming'} /> : null}
            {version.status === 'stopped' && <AIMessageStatus kind="stopped">Đã dừng.</AIMessageStatus>}
            {version.truncated && <AIMessageStatus kind="truncated">Câu trả lời bị cắt vì quá dài — hỏi ngắn hơn hoặc chia nhỏ.</AIMessageStatus>}
            {version.tierNote && <AIMessageStatus kind="note">{version.tierNote}</AIMessageStatus>}
            {version.status === 'error' && !(version.errorCode === 'blocked' && version.data !== undefined) && <AIMessageStatus kind="error" retryDisabled={busy} onRetry={() => regenerate(message.id)}>{version.error}</AIMessageStatus>}
            {version.status !== 'streaming' && version.text && <AIMessageActions text={version.text} branches={message.versions.length} branch={message.active + 1} onBranch={value => setMessages(list => list.map(item => item.id === message.id && item.role === 'assistant' ? { ...item, active: Math.min(item.versions.length - 1, Math.max(0, value - 1)) } : item))} onRetry={isLast && !busy ? () => regenerate(message.id) : undefined} />}
          </AIMessage></Fragment>;
        })}
      </AIConversation>}
    <AIQueue items={queue} onRemove={index => setQueue(list => list.filter((_, i) => i !== index))} />
    <input ref={fileInput} type="file" hidden multiple accept={`.txt,.md,.csv,.json,.ts,.tsx,.js,.css,.html,text/*${transport.canImages ? ',image/png,image/jpeg,image/webp,image/gif' : ''}`} onChange={event => void pickFiles(event.target.files)} />
    <AIPromptInput
      status={busy ? 'streaming' : 'idle'}
      value={draft}
      onValueChange={setDraft}
      inputRef={textarea}
      onSubmit={value => void send(value)}
      placeholder={placeholder}
      modelSlot={modelSlot}
      variant={composer}
      sendLabel={sendLabel}
      slashCommands={slashCommands}
      leading={typeof composerLeading === 'function' ? composerLeading({ draft, clear: () => setDraft('') }) : composerLeading}
      onStop={stop}
      onEscape={stop}
      onRecall={recall}
      onPasteFiles={files => void pickFiles(files)}
      model={model}
      onModel={setModel}
      attachments={attachments}
      onAttach={() => fileInput.current?.click()}
      onRemoveAttachment={id => setAttachments(list => list.filter(item => item.id !== id))}
      toolsOn={toolsOn}
      onTools={setToolsOn}
      onNewChat={reset}
      used={inputTokens + outputTokens}
      usedInput={inputTokens}
      usedOutput={outputTokens}
      connection={<span className="ai-link" data-live={live || undefined} title={live ? 'Đang dùng Claude thật — tính vào lượt dùng Claude của bạn' : link === 'connecting' ? 'Đang kiểm tra kết nối Claude…' : 'Không có Claude ở đây — câu trả lời được tạo cục bộ'}><i aria-hidden="true" />{live ? 'Claude' : link === 'connecting' ? 'Đang kết nối' : 'Mô phỏng'}</span>}
    />
  </section>;
}

/** @deprecated Kept for older imports — the chat is now fully working. */
export const AIChatDemo = AIChat;

/** Agent run panel: plan + confirmation + checkpoint + queue, the "agentic" half of a chat. */
export function AIAgentRun() {
  const [queue, setQueue] = useState(['Xuất PDF cho khách', 'Gửi link review cho Minh Anh']);
  const [steps, setSteps] = useState<AIPlanStep[]>([
    { title: 'Đọc masterplan và brief', detail: '3 tài liệu · 42 trang', status: 'done' },
    { title: 'Tạo 4 lớp bản đồ trong Lab', detail: 'phân khu, giao thông, tiện ích, nhãn', status: 'done' },
    { title: 'Dọn tài nguyên trùng lặp', detail: 'cần quyền xóa', status: 'active' },
    { title: 'Chuẩn bị bản trình khách hàng', status: 'pending' },
  ]);
  const decide = (approved: boolean) => setSteps(list => list.map((step, index) => index === 2 ? { ...step, status: approved ? 'done' : 'error', detail: approved ? 'đã xóa 3 tài nguyên' : 'bị từ chối' } : index === 3 && approved ? { ...step, status: 'active' } : step));
  return <section className="ai-agent">
    <AIPlan title="Kế hoạch · bản đồ SALA" steps={steps} />
    <AIConfirmation title="Cho phép xóa 3 tài nguyên trùng?" description="3 tệp · khôi phục được trong 30 ngày" action="Cho phép xóa" onDecide={decide} />
    <AITool name="delete_resources" status={steps[2].status === 'done' ? 'done' : steps[2].status === 'error' ? 'error' : 'awaiting'} input={{ ids: ['r-102', 'r-117', 'r-121'], soft: true }} error={steps[2].status === 'error' ? 'User denied permission' : undefined} output={steps[2].status === 'done' ? '{ "deleted": 3 }' : undefined} />
    <AICheckpoint time="14:32" />
    <AIQueue items={queue} onRemove={index => setQueue(list => list.filter((_, i) => i !== index))} />
  </section>;
}
