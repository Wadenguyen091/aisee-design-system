import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  RiAddLine, RiCloseLine, RiFileImageLine, RiFilePdf2Line, RiFileTextLine,
  RiFilter3Line, RiFolder3Line, RiHistoryLine, RiSearchLine, RiUserLine,
} from '@remixicon/react';
import { VaultAvatar, VaultBadge, VaultButton, VaultButtonGroup, VaultCheckbox, VaultSwitch } from '../base/VaultControls';
import { VaultPopover, VaultPopoverSection } from '../base/VaultOverlays';
import './ApplicationComponents.css';

/* --------------------------------------------------------------- Filter bar */

const STATUS_OPTIONS = [
  { value: 'Active', count: 12 },
  { value: 'Review', count: 5 },
  { value: 'Paused', count: 3 },
  { value: 'Done', count: 4 },
] as const;
type Period = '7d' | '30d' | 'quarter';
const PERIOD_LABEL: Record<Period, string> = { '7d': '7 ngày', '30d': '30 ngày', quarter: 'Quý này' };

/**
 * Filter bar: a Filter button (popover with grouped criteria), removable chips for every
 * active criterion, "Xóa tất cả" and a live result count.
 */
export function ApplicationFilterBar({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [statuses, setStatuses] = useState<string[]>(['Active', 'Review']);
  const [period, setPeriod] = useState<Period>('30d');
  const [mine, setMine] = useState(false);
  const chips: Array<{ key: string; label: string; value: string; remove: () => void }> = [
    ...statuses.map(status => ({ key: `s-${status}`, label: 'Trạng thái', value: status, remove: () => setStatuses(current => current.filter(item => item !== status)) })),
    ...(period !== '30d' ? [{ key: 'p', label: 'Thời gian', value: PERIOD_LABEL[period], remove: () => setPeriod('30d') }] : []),
    ...(mine ? [{ key: 'm', label: 'Owner', value: 'Của tôi', remove: () => setMine(false) }] : []),
  ];
  const pool: ReadonlyArray<{ value: string; count: number }> = statuses.length ? STATUS_OPTIONS.filter(item => statuses.includes(item.value)) : STATUS_OPTIONS;
  const results = Math.max(0, pool.reduce((sum, item) => sum + item.count, 0) - (mine ? 9 : 0));
  const reset = () => { setStatuses([]); setPeriod('30d'); setMine(false); };
  return <div className="application-filter">
    <VaultPopover
      open={open}
      onClose={() => setOpen(false)}
      placement="bottom-start"
      title="Bộ lọc"
      trigger={<VaultButton appearance="ghost" icon={<RiFilter3Line />} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(value => !value)}>Bộ lọc{chips.length > 0 && <VaultBadge>{chips.length}</VaultBadge>}</VaultButton>}
      footer={<><VaultButton appearance="ghost" onClick={reset}>Đặt lại</VaultButton><VaultButton priority="primary" tone="brand" onClick={() => setOpen(false)}>Xem {results} kết quả</VaultButton></>}
    >
      <VaultPopoverSection label="Trạng thái">
        {STATUS_OPTIONS.map(item => <span className="application-filter__option" key={item.value}>
          <VaultCheckbox checked={statuses.includes(item.value)} onChange={checked => setStatuses(current => checked ? [...current, item.value] : current.filter(value => value !== item.value))} label={item.value} />
          <VaultBadge>{item.count}</VaultBadge>
        </span>)}
      </VaultPopoverSection>
      <VaultPopoverSection label="Thời gian"><VaultButtonGroup value={period} onChange={setPeriod} label="Khoảng thời gian" fullWidth size="sm" options={(Object.keys(PERIOD_LABEL) as Period[]).map(value => ({ value, label: PERIOD_LABEL[value] }))} /></VaultPopoverSection>
      <VaultPopoverSection><span className="application-filter__option"><VaultSwitch checked={mine} onChange={setMine} label="Chỉ dự án của tôi" /></span></VaultPopoverSection>
    </VaultPopover>
    <div className="application-filter__chips" aria-live="polite">
      {chips.map(chip => <span className="application-chip" key={chip.key}>
        <span>{chip.value}</span>
        <button type="button" aria-label={`Bỏ lọc ${chip.label} ${chip.value}`} onClick={chip.remove}><RiCloseLine aria-hidden="true" /></button>
      </span>)}
      {chips.length === 0 && <span className="application-filter__hint">Chưa áp dụng bộ lọc nào</span>}
      {chips.length > 0 && <VaultButton appearance="text" size="sm" onClick={reset}>Xóa tất cả</VaultButton>}
    </div>
    <span className="application-filter__count"><VaultBadge>{`${results} kết quả`}</VaultBadge></span>
  </div>;
}

/* ---------------------------------------------------------- Advanced search */

type SearchItem = { id: string; scope: 'projects' | 'files' | 'people' | 'commands'; title: string; meta: string; icon: ReactNode };

const SEARCH_ITEMS: SearchItem[] = [
  { id: 'c1', scope: 'commands', title: 'Tạo dự án mới', meta: 'Lệnh', icon: <RiAddLine /> },
  { id: 'p1', scope: 'projects', title: 'SALA Urban Experience', meta: 'VA-024 · Active · Wade Nguyen', icon: <RiFolder3Line /> },
  { id: 'p2', scope: 'projects', title: 'SALA Masterplan Map', meta: 'VA-019 · Review · Minh Anh', icon: <RiFolder3Line /> },
  { id: 'p3', scope: 'projects', title: 'THACO Mobility', meta: 'VA-023 · Review · Minh Anh', icon: <RiFolder3Line /> },
  { id: 'f1', scope: 'files', title: 'SALA_Masterplan_v4.pdf', meta: 'PDF · 12.4 MB · SALA Urban Experience', icon: <RiFilePdf2Line /> },
  { id: 'f2', scope: 'files', title: 'Moodboard SALA 3D', meta: '6 ảnh · cập nhật hôm qua', icon: <RiFileImageLine /> },
  { id: 'f3', scope: 'files', title: 'Brief THACO.docx', meta: 'Tài liệu · 840 KB', icon: <RiFileTextLine /> },
  { id: 'u1', scope: 'people', title: 'Minh Anh', meta: 'Editor · minhanh@visal.studio', icon: <RiUserLine /> },
  { id: 'u2', scope: 'people', title: 'Trung Le', meta: 'Viewer · trung@visal.studio', icon: <RiUserLine /> },
];
const GROUP_LABEL: Record<SearchItem['scope'], string> = { commands: 'Lệnh', projects: 'Dự án', files: 'Tài nguyên', people: 'Thành viên' };
const RECENT = ['sala masterplan', 'moodboard 3d', 'ngân sách Q4'];

const highlight = (text: string, query: string) => {
  const at = query ? text.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (at < 0) return text;
  return <>{text.slice(0, at)}<mark>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>;
};

/**
 * Advanced search / command palette: scoped search across projects, files and people,
 * grouped results with match highlight, recent searches, full keyboard support
 * (↑ ↓ to move, ↵ to open, Esc to clear).
 */
export function ApplicationCommandSearch({ defaultQuery = 'sala' }: { defaultQuery?: string }) {
  const [query, setQuery] = useState(defaultQuery);
  const [active, setActive] = useState(0);
  const [opened, setOpened] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => SEARCH_ITEMS.filter(item => !query || item.title.toLowerCase().includes(query.toLowerCase())), [query]);
  const groups = (['commands', 'projects', 'files', 'people'] as const)
    .map(group => ({ group, items: results.filter(item => item.scope === group).slice(0, query ? 3 : 2) }))
    .filter(entry => entry.items.length && (query || entry.group === 'commands'));
  const flat = groups.flatMap(entry => entry.items);
  const current = flat[Math.min(active, flat.length - 1)];
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') { event.preventDefault(); setActive(index => Math.min(index + 1, flat.length - 1)); }
    else if (event.key === 'ArrowUp') { event.preventDefault(); setActive(index => Math.max(index - 1, 0)); }
    else if (event.key === 'Enter' && current) { event.preventDefault(); setOpened(current.title); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setQuery(''); setActive(0); }
  };
  // One line per result: icon + title (+ shortcut). Groups replace scope tabs; no meta lines, no hint footer.
  return <section className="application-search" aria-label="Tìm kiếm nâng cao">
    <div className="application-search__input">
      <RiSearchLine aria-hidden="true" />
      <input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setActive(0); setOpened(null); }} onKeyDown={onKeyDown} placeholder="Tìm hoặc gõ lệnh…" aria-label="Tìm kiếm" role="combobox" aria-expanded aria-controls="application-search-results" aria-activedescendant={current ? `application-search-${current.id}` : undefined} />
      {query ? <VaultButton appearance="text" size="sm" iconOnly icon={<RiCloseLine />} aria-label="Xóa từ khóa" className="vault-close" onClick={() => { setQuery(''); inputRef.current?.focus(); }} /> : null}
    </div>
    <div className="application-search__results" id="application-search-results" role="listbox" aria-label="Kết quả">
      {!query && <div className="application-search__group">
        <span className="application-search__caption">Gần đây</span>
        {RECENT.map(item => <button type="button" key={item} className="application-search__row is-recent" onClick={() => { setQuery(item); setActive(0); }}><span className="application-search__icon"><RiHistoryLine aria-hidden="true" /></span><span className="application-search__copy"><strong>{item}</strong></span></button>)}
      </div>}
      {groups.map(({ group, items }) => <div className="application-search__group" key={group} role="group" aria-label={GROUP_LABEL[group]}>
        <span className="application-search__caption">{GROUP_LABEL[group]}</span>
        {items.map(item => {
          const isActive = item === current;
          return <div key={item.id} id={`application-search-${item.id}`} role="option" aria-selected={isActive} className="application-search__row" data-active={isActive || undefined} onMouseEnter={() => setActive(flat.indexOf(item))} onClick={() => setOpened(item.title)}>
            <span className="application-search__icon">{item.scope === 'people' ? <VaultAvatar name={item.title} size="sm" /> : item.icon}</span>
            <span className="application-search__copy"><strong>{highlight(item.title, query)}</strong></span>
          </div>;
        })}
      </div>)}
      {query && flat.length === 0 && <div className="application-empty"><strong>Không tìm thấy “{query}”</strong></div>}
    </div>
    <span className="application-sr-label" aria-live="polite">{opened ? `Đã mở ${opened}` : `${flat.length} kết quả`}</span>
  </section>;
}
