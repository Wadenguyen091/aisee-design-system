import { useState } from 'react';
import {
  RiChatNewLine, RiArchiveFill, RiDeleteBinFill, RiEditFill, RiMoreFill, RiPushpinFill, RiSidebarFoldLine, RiSidebarUnfoldLine, RiUnpinFill,
} from '@remixicon/react';
import { VaultBadge, VaultButton, VaultSearch } from '../base/VaultControls';
import { VaultEmptyState } from '../base/VaultContent';
import { VaultMenu, VaultMenuItem, VaultMenuSeparator } from '../base/VaultOverlays';
import { aiDayLabel } from './ApplicationAI';
import './ApplicationAI.css';

/*
 * AI conversation history list (search, rename, optional pin / archive / delete, grouped by day). Used by Cổng AI
 * for its server sessions (v115); the browser-kept thread store and its Markdown export were removed with the
 * local chat history.
 */

/** One conversation in the list. `key` is the owner's id for it (e.g. the session id). */
export type AIThread = { id: string; key: string; title: string; renamed?: boolean; pinned?: boolean; count: number; updatedAt: number; preview: string; scope?: string };

const HOUR = 3600000;

/* ------------------------------------------------------- Conversation list */

const GROUP_ORDER = ['Đã ghim', 'Hôm nay', 'Hôm qua', '7 ngày qua', 'Cũ hơn'] as const;
const groupOf = (thread: AIThread, now: number) => {
  if (thread.pinned) return 'Đã ghim';
  const label = aiDayLabel(thread.updatedAt || now, now);
  if (label === 'Hôm nay' || label === 'Hôm qua') return label;
  return now - thread.updatedAt < 7 * 24 * HOUR ? '7 ngày qua' : 'Cũ hơn';
};

/**
 * Conversation history: header 56 (title, count badge, new chat), search, then threads grouped
 * Đã ghim · Hôm nay · Hôm qua · 7 ngày qua · Cũ hơn. Rows 56: title + last line, message count badge,
 * overflow menu (pin, rename, delete). The open thread uses the selected row (gradient + rail).
 */
export function AIConversationList({ threads, activeId, onSelect, onNew, onRename, onPin, onDelete, onArchive, variant = 'panel', title = 'Trò chuyện', query: outerQuery, collapsed = false, onCollapsedChange, side = 'left', newLabel = 'Cuộc trò chuyện mới' }: {
  threads: AIThread[];
  /** panel = the workspace column (hairline right); menu = inside a dropdown/popover (no frame, capped height). */
  variant?: 'panel' | 'menu';
  title?: string;
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string) => void;
  /** Row menu actions: each one appears only when given (e.g. server sessions can be archived, not pinned or deleted). */
  onPin?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  /** Label of the new-thread button (e.g. "Phiên mới"). */
  newLabel?: string;
  /** Search owned by the page (e.g. in its topbar): the list filters by it and drops its own search field. */
  query?: string;
  /** With `onCollapsedChange` the list folds to a 56 rail (expand · new chat) from a button in its header. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Which edge the list sits on: its hairline faces the content and the fold icons point the right way. */
  side?: 'left' | 'right';
}) {
  const [ownQuery, setQuery] = useState('');
  const query = outerQuery ?? ownQuery;
  const [menuFor, setMenuFor] = useState('');
  const now = Date.now();
  const needle = query.trim().toLowerCase();
  const visible = threads.filter(thread => !needle || `${thread.title} ${thread.preview}`.toLowerCase().includes(needle));
  const groups = GROUP_ORDER.map(label => ({ label, items: visible.filter(thread => groupOf(thread, now) === label).sort((x, y) => y.updatedAt - x.updatedAt) })).filter(group => group.items.length);
  // Fold icons follow the edge: a right-hand list folds towards the right.
  const foldIcon = side === 'right' ? <RiSidebarUnfoldLine /> : <RiSidebarFoldLine />;
  const unfoldIcon = side === 'right' ? <RiSidebarFoldLine /> : <RiSidebarUnfoldLine />;
  if (collapsed && onCollapsedChange) return <aside className="ai-threads" data-variant={variant} data-side={side} data-collapsed aria-label="Lịch sử trò chuyện (thu gọn)">
    <VaultButton type="button" appearance="text" size="sm" iconOnly icon={unfoldIcon} aria-label={`Mở ${title.toLowerCase()}`} title={`Mở ${title.toLowerCase()}`} aria-expanded={false} onClick={() => onCollapsedChange(false)} />
    <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiChatNewLine />} aria-label={newLabel} title={newLabel} onClick={onNew} />
  </aside>;
  return <aside className="ai-threads" data-variant={variant} data-side={side} aria-label="Lịch sử trò chuyện">
    <header className="ai-threads__head">
      <span><strong>{title}</strong><VaultBadge>{needle ? `${visible.length}/${threads.length}` : threads.length}</VaultBadge></span>
      <span className="ai-threads__actions">
        <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiChatNewLine />} aria-label={newLabel} title={newLabel} onClick={onNew} />
        {onCollapsedChange && <VaultButton type="button" appearance="text" size="sm" iconOnly icon={foldIcon} aria-label={`Thu gọn ${title.toLowerCase()}`} title={`Thu gọn ${title.toLowerCase()}`} aria-expanded onClick={() => onCollapsedChange(true)} />}
      </span>
    </header>
    {outerQuery === undefined && <div className="ai-threads__search"><VaultSearch label="Tìm cuộc trò chuyện" placeholder="Tìm cuộc trò chuyện…" value={query} onChange={event => setQuery(event.target.value)} onClear={() => setQuery('')} /></div>}
    <div className="ai-threads__list">
      {groups.length ? groups.map(group => <section key={group.label} aria-label={group.label}>
        <span className="ai-threads__group">{group.label}</span>
        <div role="list">
          {group.items.map(thread => <div role="listitem" key={thread.id} className="ai-thread" data-active={thread.id === activeId || undefined} data-menu={menuFor === thread.id || undefined}>
            <button type="button" className="ai-thread__select" aria-current={thread.id === activeId || undefined} onClick={() => onSelect(thread.id)}>
              <span className="ai-thread__copy"><strong>{thread.title}</strong><small>{thread.preview || 'Chưa có tin nhắn'}</small></span>
              {thread.count > 0 && <VaultBadge>{thread.count}</VaultBadge>}
            </button>
            <span className="ai-thread__more">
              <VaultButton type="button" appearance="text" size="sm" iconOnly icon={<RiMoreFill />} aria-label={`Tùy chọn ${thread.title}`} aria-haspopup="menu" aria-expanded={menuFor === thread.id} onClick={() => setMenuFor(current => current === thread.id ? '' : thread.id)} />
              {menuFor === thread.id && <VaultMenu label={`Tùy chọn ${thread.title}`} autoFocus onClose={() => setMenuFor('')} className="ai-thread__menu">
                {onPin && <VaultMenuItem icon={thread.pinned ? <RiUnpinFill /> : <RiPushpinFill />} onSelect={() => { onPin(thread.id); setMenuFor(''); }}>{thread.pinned ? 'Bỏ ghim' : 'Ghim'}</VaultMenuItem>}
                <VaultMenuItem icon={<RiEditFill />} onSelect={() => { onRename(thread.id); setMenuFor(''); }}>Đổi tên</VaultMenuItem>
                {onArchive && <VaultMenuItem icon={<RiArchiveFill />} onSelect={() => { onArchive(thread.id); setMenuFor(''); }}>Lưu trữ</VaultMenuItem>}
                {onDelete && <><VaultMenuSeparator />
                <VaultMenuItem icon={<RiDeleteBinFill />} tone="danger" onSelect={() => { onDelete(thread.id); setMenuFor(''); }}>Xóa</VaultMenuItem></>}
              </VaultMenu>}
            </span>
          </div>)}
        </div>
      </section>) : <VaultEmptyState art="search" title="Không có cuộc trò chuyện khớp" description="Thử từ khóa khác." />}
    </div>
  </aside>;
}
