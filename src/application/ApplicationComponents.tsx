import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import {
  RiAddLine, RiArchiveLine, RiArrowDownSFill, RiArrowLeftSLine, RiArrowUpDownLine, RiBuilding2Line, RiCalendarLine, RiCheckLine,
  RiDownloadLine, RiExternalLinkLine, RiFileImageLine, RiFilePdf2Line, RiFileTextLine, RiFilter3Line,
  RiGoogleFill, RiLayoutGridLine, RiLinkM, RiListUnordered, RiLockLine, RiLogoutBoxRLine, RiMailLine, RiMoreFill,
  RiNotification3Line, RiSettings3Line, RiShieldCheckLine, RiUserAddLine, RiUserLine,
  RiEyeLine, RiEyeOffLine,
} from '@remixicon/react';
import {
  VaultAvatar, VaultBadge, VaultButton, VaultButtonGroup, VaultCheckbox, VaultDropdownTrigger, VaultField,
  VaultPagination, VaultProgress, VaultSearch, VaultTabs,
} from '../base/VaultControls';
import { VaultSparkline } from '../base/VaultCharts';
import { VaultEmptyState } from '../base/VaultContent';
import {
  VaultDialog, VaultDialogBody, VaultMenu, VaultMenuGroup, VaultMenuItem, VaultMenuSeparator, VaultPopover,
  VaultPopoverSection, VaultSheet,
} from '../base/VaultOverlays';
import './ApplicationComponents.css';
import { publicAsset } from '../assets';

/*
 * Application components — composed patterns built only from base components.
 * Shared language: full-bleed rows (40 / 48 / 56 / 64), hairline dividers, tinted 64px icon cells,
 * one Primary per region, everything on the 4px grid.
 */

const AVATAR = publicAsset('/avatars/visal-avatar.png');

/* ------------------------------------------------------------------ Toolbar */

export function ApplicationToolbar() {
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  return <header className="application-toolbar">
    <div className="application-toolbar__context">
      <div><strong>Thư viện dự án</strong><VaultBadge tone="category">24</VaultBadge></div>
    </div>
    <div className="application-toolbar__tools">
      <VaultSearch label="Tìm dự án" placeholder="Tìm dự án…" value={query} onChange={event => setQuery(event.target.value)} onClear={() => setQuery('')} />
      <VaultButton appearance="ghost" icon={<RiFilter3Line />}>Bộ lọc<VaultBadge>2</VaultBadge></VaultButton>
      <VaultDropdownTrigger label="Mới nhất" ariaLabel="Sắp xếp dự án" icon={<RiArrowUpDownLine />} />
      <VaultButtonGroup value={view} onChange={setView} label="Kiểu hiển thị" options={[
        { value: 'grid', label: <span className="sr-only">Lưới</span>, icon: <RiLayoutGridLine /> },
        { value: 'list', label: <span className="sr-only">Danh sách</span>, icon: <RiListUnordered /> },
      ]} />
      <span className="application-toolbar__divider" aria-hidden="true" />
      <VaultButton priority="primary" tone="brand" icon={<RiAddLine />}>Tạo dự án</VaultButton>
      <VaultButton appearance="text" iconOnly icon={<RiMoreFill />} aria-label="Tùy chọn khác" />
    </div>
  </header>;
}

/**
 * App top bar — the one header every module page uses. Full-bleed, 56 tall, hairline below.
 * Left: full-bleed AISEE mark, then title (or breadcrumb / any node). Centre: optional tabs. Right: actions, then the profile control.
 */
export function ApplicationTopbar({ title, leading, center, actions, profile, className = '' }: {
  title?: ReactNode;
  /** Replaces the title, e.g. a breadcrumb. */
  leading?: ReactNode;
  center?: ReactNode;
  actions?: ReactNode;
  profile?: ReactNode;
  className?: string;
}) {
  // Without a centre the actions take the width they need instead of half the bar (Map topbar was squeezed).
  return <header className={`application-topbar ${className}`.trim()} data-layout={center ? 'three' : 'two'}>
    <span className="application-topbar__brand" aria-hidden="true"><img src={publicAsset('/aisee-mark.svg')} alt="" /></span>
    <div className="application-topbar__lead">{leading ?? (title && <strong>{title}</strong>)}</div>
    {center && <div className="application-topbar__center">{center}</div>}
    <div className="application-topbar__end">{actions}{profile}</div>
  </header>;
}

/* ----------------------------------------------------------- Profile dropdown */

export type ApplicationProfileItem = {
  key: string;
  label: string;
  icon?: ReactNode;
  /** Secondary text or a trailing icon (e.g. a chevron for items that open a sub-view). */
  hint?: ReactNode;
  shortcut?: string;
  tone?: 'neutral' | 'danger';
  checked?: boolean;
  onSelect?: () => void;
};

export type ApplicationProfileMenuProps = {
  name?: string;
  email?: string;
  avatarSrc?: string;
  status?: 'online' | 'away' | 'offline' | null;
  badge?: string;
  badgeTone?: 'info' | 'success' | 'warning' | 'danger' | 'category';
  /** Replaces the user avatar in the trigger (24) and the identity row (32), e.g. an agent's identity avatar. */
  avatar?: { trigger: ReactNode; identity: ReactNode };
  /** Which edge the menu aligns to: end (profile at the right of a topbar) or start (switcher at the left). */
  align?: 'start' | 'end';
  /** Which side the menu opens on: below the trigger (default) or above it (a trigger at the bottom of a panel). */
  side?: 'bottom' | 'top';
  /** Workspace switcher (radio group). Omit to hide. Items may carry their own icon and hint (e.g. agents). */
  workspaces?: Array<{ id: string; label: string; icon?: ReactNode; hint?: ReactNode }>;
  workspacesLabel?: string;
  workspace?: string;
  onWorkspace?: (id: string) => void;
  /** Menu body as groups separated by a divider. Defaults to a demo set. */
  groups?: ApplicationProfileItem[][];
  /** Block between the identity row and the menu (progress, guest notice…). */
  notice?: ReactNode;
  /** Sub-view replacing the menu (Hồ sơ, Giao diện…), with a back row. */
  panel?: { title: string; onBack: () => void; content: ReactNode } | null;
  /** Controlled open state; leave undefined for uncontrolled. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  triggerLabel?: string;
  /** Second line on the trigger under the name (e.g. an agent's status and model); the trigger grows to 48. */
  caption?: ReactNode;
};

const DEMO_WORKSPACES = [{ id: 'visal', label: 'VISAL Studio' }, { id: 'vex', label: 'VEX Labs' }];

/**
 * Profile dropdown. Trigger pill 40 (avatar + name + chevron). Menu 280: identity 64,
 * optional notice, workspace radio group, item groups (rows 40, flush), optional sub-view panel.
 * The app's account control renders through this component with real data.
 */
export function ApplicationProfileMenu({
  name = 'Wade Nguyen', email = 'wade@visal.studio', avatarSrc = AVATAR, status = 'online', badge = 'Pro', badgeTone = 'info', avatar, align = 'end', side = 'bottom',
  workspaces, workspacesLabel = 'Workspace', workspace, onWorkspace, groups, notice, panel, open: openProp, onOpenChange, defaultOpen = false,
  triggerLabel = 'Mở menu tài khoản', caption,
}: ApplicationProfileMenuProps) {
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const [demoWorkspace, setDemoWorkspace] = useState('visal');
  const open = openProp ?? innerOpen;
  const setOpen = (next: boolean) => { if (openProp === undefined) setInnerOpen(next); onOpenChange?.(next); };
  const rootRef = useRef<HTMLDivElement>(null);
  const spaces: ApplicationProfileMenuProps['workspaces'] = workspaces ?? (groups ? undefined : DEMO_WORKSPACES);
  const currentSpace = workspace ?? demoWorkspace;
  const pickSpace = (id: string) => { if (onWorkspace) onWorkspace(id); else setDemoWorkspace(id); };
  const itemGroups: ApplicationProfileItem[][] = groups ?? [
    [{ key: 'account', label: 'Tài khoản', icon: <RiUserLine /> }, { key: 'notify', label: 'Thông báo', icon: <RiNotification3Line />, hint: '3 mới' }, { key: 'settings', label: 'Cài đặt', icon: <RiSettings3Line /> }],
    [{ key: 'signout', label: 'Đăng xuất', icon: <RiLogoutBoxRLine />, tone: 'danger', onSelect: () => setOpen(false) }],
  ];
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!rootRef.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', outside, true);
    return () => document.removeEventListener('pointerdown', outside, true);
  });
  const displayName = name || 'Khách';
  return <div ref={rootRef} className="application-profile" data-align={align} data-side={side} onKeyDown={(event) => { if (event.key === 'Escape' && open) { event.stopPropagation(); if (panel) panel.onBack(); else setOpen(false); } }}>
    <button type="button" className="application-profile__trigger" aria-label={triggerLabel} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}>
      {avatar?.trigger ?? <VaultAvatar name={displayName} src={avatarSrc || undefined} size="sm" status={status ?? undefined} />}
      {caption ? <span className="application-profile__name"><span>{displayName}</span><small>{caption}</small></span> : <span>{displayName}</span>}
      <RiArrowDownSFill aria-hidden="true" />
    </button>
    {open && <div className="application-profile__menu">
      {panel ? <>
        <div className="application-profile__panel-head">
          <VaultButton appearance="text" size="sm" iconOnly icon={<RiArrowLeftSLine />} aria-label="Quay lại" className="vault-close" onClick={panel.onBack} />
          <strong>{panel.title}</strong>
        </div>
        <div className="application-profile__panel">{panel.content}</div>
      </> : <>
        <div className="application-profile__identity">
          {avatar?.identity ?? <VaultAvatar name={displayName} src={avatarSrc || undefined} size="md" status={status ?? undefined} />}
          <div><strong>{displayName}</strong>{email && <span>{email}</span>}</div>
          {badge && <VaultBadge tone={badgeTone}>{badge}</VaultBadge>}
        </div>
        {notice && <div className="application-profile__notice">{notice}</div>}
        <VaultMenu label="Tài khoản">
          {spaces && <><VaultMenuGroup label={workspacesLabel}>
            {spaces.map(space => <VaultMenuItem key={space.id} icon={space.icon ?? <RiBuilding2Line />} hint={space.hint} checked={space.id === currentSpace} onSelect={() => pickSpace(space.id)}>{space.label}</VaultMenuItem>)}
          </VaultMenuGroup><VaultMenuSeparator /></>}
          {itemGroups.map((group, index) => <Fragment key={index}>
            {index > 0 && <VaultMenuSeparator />}
            {group.map(item => <VaultMenuItem key={item.key} icon={item.icon} hint={item.hint} shortcut={item.shortcut} tone={item.tone} checked={item.checked} onSelect={item.onSelect}>{item.label}</VaultMenuItem>)}
          </Fragment>)}
        </VaultMenu>
      </>}
    </div>}
  </div>;
}

/* -------------------------------------------------------------------- Popup */

const MEMBERS = [
  { name: 'Wade Nguyen', email: 'wade@visal.studio', role: 'Owner' },
  { name: 'Minh Anh', email: 'minhanh@visal.studio', role: 'Editor' },
  { name: 'Trung Le', email: 'trung@visal.studio', role: 'Viewer' },
];

/** Invite members — a form dialog composed from Dialog, Field, Dropdown and Avatar. */
export function ApplicationInviteDialog({ open, onClose, inline = false }: { open: boolean; onClose: () => void; inline?: boolean }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Nhập email hợp lệ, ví dụ name@company.com'); return; }
    setError(''); setEmail('');
  };
  return <VaultDialog
    inline={inline}
    open={open}
    onClose={onClose}
    size="md"
    icon={<RiUserAddLine />}
    title="Mời thành viên"
    description="VISAL Studio · 3 thành viên"
    footer={<><VaultButton appearance="ghost" onClick={onClose}>Hủy</VaultButton><VaultButton priority="primary" tone="brand" onClick={submit}>Gửi lời mời</VaultButton></>}
  >
    <VaultDialogBody>
      <div className="application-invite__row">
        <VaultField label="Email" showLabel placeholder="name@company.com" icon={<RiMailLine />} value={email} error={error || undefined} onChange={event => { setEmail(event.target.value); setError(''); }} />
        <div className="application-invite__role"><span>Quyền</span><VaultDropdownTrigger label="Editor" ariaLabel="Quyền của thành viên mới" icon={<RiShieldCheckLine />} /></div>
      </div>
    </VaultDialogBody>
    <VaultDialogBody flush>
      <div className="application-list" role="list" aria-label="Thành viên hiện tại">
        {MEMBERS.map(member => <div role="listitem" className="application-list__row" key={member.email}>
          <VaultAvatar name={member.name} size="sm" />
          <span className="application-list__copy"><strong>{member.name}</strong><small>{member.email}</small></span>
          <VaultBadge tone={member.role === 'Owner' ? 'info' : 'category'}>{member.role}</VaultBadge>
        </div>)}
      </div>
    </VaultDialogBody>
  </VaultDialog>;
}

/** Specimen wrapper: trigger + invite dialog rendered in place. */
export function ApplicationDialog({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className="application-demo-stage">
    {!open && <VaultButton appearance="ghost" icon={<RiUserAddLine />} onClick={() => setOpen(true)}>Mời thành viên</VaultButton>}
    <ApplicationInviteDialog inline open={open} onClose={() => setOpen(false)} />
  </div>;
}

/* --------------------------------------------------------------- Side sheet */

type SheetProject = { id: string; name: string; owner: string; status: 'Active' | 'Review' | 'Paused'; budget: string; due: string; progress: number };
const SHEET_PROJECTS: SheetProject[] = [
  { id: 'VA-024', name: 'SALA Urban Experience', owner: 'Wade Nguyen', status: 'Active', budget: '₫480M', due: '15 Dec 2026', progress: 68 },
  { id: 'VA-023', name: 'THACO Mobility', owner: 'Minh Anh', status: 'Review', budget: '₫320M', due: '02 Dec 2026', progress: 84 },
  { id: 'VA-022', name: 'Cleft Care Platform', owner: 'Trung Le', status: 'Active', budget: '₫210M', due: '20 Jan 2027', progress: 36 },
  { id: 'VA-021', name: 'Future Classroom', owner: 'Linh Tran', status: 'Paused', budget: '₫160M', due: '—', progress: 12 },
];
const statusTone = (status: SheetProject['status']) => status === 'Active' ? 'success' : status === 'Review' ? 'warning' : 'category';

/** Record detail panel that slides in from the right. */
export function ApplicationRecordSheet({ project, open, onClose, inline = false }: { project: SheetProject; open: boolean; onClose: () => void; inline?: boolean }) {
  const [tab, setTab] = useState<'overview' | 'activity' | 'files'>('overview');
  return <VaultSheet
    inline={inline}
    open={open}
    onClose={onClose}
    icon={<RiFileTextLine />}
    title={project.name}
    description={<><VaultBadge>{project.id}</VaultBadge><VaultBadge>2 giờ trước</VaultBadge></>}
    toolbar={<VaultTabs value={tab} onChange={setTab} label="Chi tiết dự án" options={[{ value: 'overview', label: 'Tổng quan' }, { value: 'activity', label: 'Hoạt động', badge: 4 }, { value: 'files', label: 'Tệp' }]} />}
    footer={<><VaultButton appearance="text" icon={<RiArchiveLine />} className="application-footer-start">Lưu trữ</VaultButton><VaultButton priority="primary" tone="brand" icon={<RiExternalLinkLine />}>Mở dự án</VaultButton></>}
  >
    {tab === 'overview' && <>
      <dl className="application-props">
        <div><dt>Trạng thái</dt><dd><VaultBadge tone={statusTone(project.status)}>{project.status}</VaultBadge></dd></div>
        <div><dt>Owner</dt><dd><VaultAvatar name={project.owner} size="sm" />{project.owner}</dd></div>
        <div><dt>Ngân sách</dt><dd><strong>{project.budget}</strong></dd></div>
        <div><dt>Hạn chót</dt><dd><RiCalendarLine aria-hidden="true" />{project.due}</dd></div>
        <div><dt>Tiến độ</dt><dd><VaultProgress value={project.progress} label={`Tiến độ ${project.name}`} /><span className="application-props__num">{project.progress}%</span></dd></div>
      </dl>
      <section className="application-sheet-section"><h3>Mô tả</h3><p>Trải nghiệm đô thị cho khu SALA: bản đồ tương tác, tour 3D và bộ nhận diện điểm đến.</p></section>
      <section className="application-sheet-section"><h3>Thành viên</h3><div className="application-avatar-row">{['Wade Nguyen', 'Minh Anh', 'Trung Le', 'Linh Tran'].map(name => <VaultAvatar key={name} name={name} />)}<VaultButton appearance="ghost" size="sm" iconOnly icon={<RiAddLine />} aria-label="Thêm thành viên" className="application-avatar-add" /></div></section>
    </>}
    {tab === 'activity' && <ol className="application-timeline">
      {[['Minh Anh', 'chuyển trạng thái sang Review', '2 giờ trước'], ['Wade Nguyen', 'tải lên 6 tệp vào Moodboard', 'Hôm qua'], ['Trung Le', 'bình luận ở Tour 3D', '27 Oct'], ['Wade Nguyen', 'tạo dự án', '12 Oct']].map(([who, what, when]) => <li key={what}><VaultAvatar name={who} size="sm" /><span><strong>{who}</strong> {what}</span><small>{when}</small></li>)}
    </ol>}
    {tab === 'files' && <div className="application-list" role="list">
      {[['Masterplan_v4.pdf', '12.4 MB', <RiFilePdf2Line key="p" />], ['Moodboard 3D', '6 ảnh', <RiFileImageLine key="i" />], ['Brief khách hàng.docx', '840 KB', <RiFileTextLine key="d" />]].map(([name, size, icon]) => <div role="listitem" className="application-list__row" key={String(name)}>
        <span className="application-list__icon">{icon}</span><span className="application-list__copy"><strong>{name}</strong><small>{size}</small></span>
        <VaultButton appearance="text" size="sm" iconOnly icon={<RiDownloadLine />} aria-label={`Tải ${name}`} />
      </div>)}
    </div>}
  </VaultSheet>;
}

/** Specimen: a project list; selecting a row opens its sheet from the right. */
export function ApplicationSheetDemo({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const [selected, setSelected] = useState<string | null>(defaultOpen ? SHEET_PROJECTS[0].id : null);
  const project = SHEET_PROJECTS.find(item => item.id === selected) ?? SHEET_PROJECTS[0];
  return <div className="application-demo-stage is-sheet">
    <div className="application-list is-framed" role="list" aria-label="Dự án">
      {SHEET_PROJECTS.map(item => <button type="button" role="listitem" key={item.id} className="application-list__row is-button" aria-current={item.id === selected || undefined} onClick={() => setSelected(item.id)}>
        <code>{item.id}</code><span className="application-list__copy"><strong>{item.name}</strong><small>{item.owner}</small></span>
        <VaultBadge tone={statusTone(item.status)}>{item.status}</VaultBadge>
      </button>)}
    </div>
    <ApplicationRecordSheet key={project.id} inline project={project} open={selected !== null} onClose={() => setSelected(null)} />
  </div>;
}

/* ---------------------------------------------------------- Popover control */

export function ApplicationPopoverControl({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [columns, setColumns] = useState<Record<string, boolean>>({ Owner: true, 'Trạng thái': true, 'Cập nhật': false, 'Ngân sách': true });
  return <VaultPopover
    className="application-popover"
    open={open}
    onClose={() => setOpen(false)}
    title="Tùy chỉnh hiển thị"
    trigger={<VaultButton appearance="ghost" icon={<RiSettings3Line />} aria-expanded={open} aria-haspopup="dialog" onClick={() => setOpen(value => !value)}>Tùy chỉnh</VaultButton>}
    footer={<><VaultButton appearance="ghost">Đặt lại</VaultButton><VaultButton priority="primary" tone="brand" onClick={() => setOpen(false)}>Áp dụng</VaultButton></>}
  >
    <VaultPopoverSection><VaultButtonGroup value={density} onChange={setDensity} label="Mật độ bảng" fullWidth options={[{ value: 'comfortable', label: 'Thoáng' }, { value: 'compact', label: 'Gọn' }]} /></VaultPopoverSection>
    <VaultPopoverSection>{Object.entries(columns).map(([item, checked]) => <VaultCheckbox key={item} checked={checked} onChange={value => setColumns(current => ({ ...current, [item]: value }))} label={item} />)}</VaultPopoverSection>
  </VaultPopover>;
}

/* -------------------------------------------------------------- Data table */

export type ApplicationTableRow = {
  id: string; project: string; owner: string; status: 'Active' | 'Review' | 'Paused'; updated: string; budget: string;
};

const DEFAULT_TABLE_ROWS: ApplicationTableRow[] = [
  { id: 'VA-024', project: 'SALA Urban Experience', owner: 'Wade Nguyen', status: 'Active', updated: '29 Oct 2026', budget: '₫480M' },
  { id: 'VA-023', project: 'THACO Mobility', owner: 'Minh Anh', status: 'Review', updated: '28 Oct 2026', budget: '₫320M' },
  { id: 'VA-022', project: 'Cleft Care Platform', owner: 'Trung Le', status: 'Active', updated: '27 Oct 2026', budget: '₫210M' },
  { id: 'VA-021', project: 'Future Classroom', owner: 'Linh Tran', status: 'Paused', updated: '25 Oct 2026', budget: '₫160M' },
  { id: 'VA-020', project: 'VISAL Brand System', owner: 'Wade Nguyen', status: 'Review', updated: '24 Oct 2026', budget: '₫190M' },
];

export function ApplicationDataTable({ rows = DEFAULT_TABLE_ROWS }: { rows?: ApplicationTableRow[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [sortAscending, setSortAscending] = useState(true);
  const [page, setPage] = useState(1);
  const visibleRows = useMemo(() => rows
    .filter(row => `${row.project} ${row.owner} ${row.status}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sortAscending ? a.project.localeCompare(b.project) : b.project.localeCompare(a.project)), [query, rows, sortAscending]);
  const allSelected = visibleRows.length > 0 && visibleRows.every(row => selected.includes(row.id));
  return <section className="application-table">
    <header><div className="application-table__title"><strong>Danh sách dự án</strong><VaultBadge>{rows.length}</VaultBadge></div><div><VaultSearch label="Tìm trong bảng" placeholder="Tìm…" value={query} onChange={event => setQuery(event.target.value)} onClear={() => setQuery('')} /><VaultButton appearance="ghost" icon={<RiDownloadLine />}>Export</VaultButton></div></header>
    {selected.length > 0 && <div className="application-table__selection"><span><VaultBadge>{selected.length}</VaultBadge>đã chọn</span><VaultButton appearance="text" size="sm">Gắn nhãn</VaultButton><VaultButton appearance="text" size="sm">Chuyển trạng thái</VaultButton><VaultButton appearance="text" size="sm" onClick={() => setSelected([])}>Bỏ chọn</VaultButton></div>}
    <div className="application-table__scroll">
      {visibleRows.length === 0 ? <VaultEmptyState art="projects" title="Chưa có dự án nào" description="Tạo dự án đầu tiên hoặc đổi từ khóa tìm kiếm." action={<VaultButton priority="primary" tone="brand" icon={<RiAddLine />}>Tạo dự án</VaultButton>} /> : <table>
        <thead><tr>
          <th className="is-check"><span className="application-sr-label"><VaultCheckbox checked={allSelected} indeterminate={selected.length > 0 && !allSelected} onChange={checked => setSelected(checked ? visibleRows.map(row => row.id) : [])} label="Chọn tất cả" /></span></th>
          <th>ID</th>
          <th><button type="button" className="application-table__sort" onClick={() => setSortAscending(value => !value)}>Dự án <RiArrowUpDownLine aria-hidden="true" /></button></th>
          <th>Owner</th><th>Trạng thái</th><th>Cập nhật</th><th className="is-number">Ngân sách</th><th><span className="sr-only">Thao tác</span></th>
        </tr></thead>
        <tbody>{visibleRows.map(row => <tr key={row.id} data-selected={selected.includes(row.id) || undefined}>
          <td className="is-check"><span className="application-sr-label"><VaultCheckbox checked={selected.includes(row.id)} onChange={checked => setSelected(current => checked ? [...current, row.id] : current.filter(id => id !== row.id))} label={`Chọn ${row.project}`} /></span></td>
          <td><VaultBadge>{row.id}</VaultBadge></td>
          <td><strong>{row.project}</strong></td>
          <td><span className="application-table__owner"><VaultAvatar name={row.owner} size="sm" />{row.owner}</span></td>
          <td><VaultBadge tone={statusTone(row.status)}>{row.status}</VaultBadge></td>
          <td><VaultBadge>{row.updated}</VaultBadge></td>
          <td className="is-number"><strong>{row.budget}</strong></td>
          <td className="is-action"><VaultButton appearance="text" size="sm" iconOnly icon={<RiMoreFill />} aria-label={`Tùy chọn ${row.project}`} /></td>
        </tr>)}</tbody>
      </table>}
    </div>
    <footer><VaultBadge>{`${visibleRows.length ? 1 : 0}–${visibleRows.length} / ${rows.length}`}</VaultBadge><VaultPagination page={page} total={Math.max(1, Math.ceil(rows.length / 5))} onChange={setPage} label="Phân trang bảng dự án" /></footer>
  </section>;
}

/* ------------------------------------------------------------ Auth (login / register) */

const passwordScore = (value: string) => [value.length >= 8, /[A-Z]/.test(value), /\d/.test(value), /[^A-Za-z0-9]/.test(value)].filter(Boolean).length;
const SCORE_LABEL = ['Quá ngắn', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];

/** Auth card shell: centred mark + title (+ optional line), the form body, and an optional muted footer. */
export function ApplicationAuthCard({ title, description, label, mark = 'V', children, footer, className = '' }: {
  title: ReactNode;
  description?: ReactNode;
  label?: string;
  mark?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return <section className={`application-auth ${className}`.trim()} aria-label={label}>
    <div className="application-auth__body">
      <header><span className="application-auth__mark" aria-hidden="true">{mark}</span><h2>{title}</h2>{description && <p>{description}</p>}</header>
      {children}
    </div>
    {footer && <footer>{footer}</footer>}
  </section>;
}

export function ApplicationAuthForm({ defaultMode = 'login' }: { defaultMode?: 'login' | 'register' }) {
  const [mode, setMode] = useState(defaultMode);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; terms?: string }>({});
  const score = passwordScore(password);
  const isLogin = mode === 'login';
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Email chưa đúng định dạng';
    if (password.length < 8) next.password = 'Mật khẩu cần tối thiểu 8 ký tự';
    if (!isLogin && !agreed) next.terms = 'Cần đồng ý điều khoản để tiếp tục';
    setErrors(next);
  };
  return <section className="application-auth" aria-label={isLogin ? 'Đăng nhập' : 'Đăng ký'}>
    <form onSubmit={submit} noValidate>
      <header><span className="application-auth__mark" aria-hidden="true">V</span><h2>{isLogin ? 'Đăng nhập Vault' : 'Tạo tài khoản Vault'}</h2></header>
      <VaultButton type="button" appearance="ghost" icon={<RiGoogleFill />} className="application-auth__provider">Tiếp tục với Google</VaultButton>
      <div className="application-auth__divider vault-fade-rule"><span>hoặc</span></div>
      {!isLogin && <VaultField label="Họ và tên" showLabel placeholder="Nguyễn Minh" autoComplete="name" icon={<RiUserLine />} />}
      <VaultField label="Email" showLabel type="email" placeholder="name@company.com" autoComplete="email" icon={<RiMailLine />} value={email} error={errors.email} onChange={event => setEmail(event.target.value)} />
      <div className="application-auth__password">
        <VaultField label="Mật khẩu" showLabel type={showPassword ? 'text' : 'password'} placeholder="Tối thiểu 8 ký tự" autoComplete={isLogin ? 'current-password' : 'new-password'} icon={<RiLockLine />} value={password} error={errors.password} onChange={event => setPassword(event.target.value)} />
        <VaultButton type="button" appearance="text" size="sm" iconOnly icon={showPassword ? <RiEyeOffLine /> : <RiEyeLine />} aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'} aria-pressed={showPassword} className="application-auth__reveal" onClick={() => setShowPassword(value => !value)} />
        {!isLogin && password && <div className="application-auth__strength" data-score={score} aria-live="polite"><span aria-hidden="true">{[0, 1, 2, 3].map(index => <i key={index} data-on={index < score || undefined} />)}</span><small>{SCORE_LABEL[score]}</small></div>}
      </div>
      {isLogin && <div className="application-auth__options"><VaultButton type="button" appearance="text" size="sm">Quên mật khẩu?</VaultButton></div>}
      {!isLogin && <div className="application-auth__terms" data-error={errors.terms ? true : undefined}><VaultCheckbox checked={agreed} onChange={setAgreed} label="Tôi đồng ý với Điều khoản và Chính sách riêng tư" />{errors.terms && <small>{errors.terms}</small>}</div>}
      <VaultButton type="submit" priority="primary" tone="brand" className="application-auth__submit">{isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}</VaultButton>
    </form>
    <footer>{isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}<VaultButton appearance="text" size="sm" onClick={() => { setMode(current => current === 'login' ? 'register' : 'login'); setErrors({}); }}>{isLogin ? 'Đăng ký' : 'Đăng nhập'}</VaultButton></footer>
  </section>;
}

/* -------------------------------------------------------------- KPI cell */

export function ApplicationDashboardCard({
  label = 'Doanh thu', value = '₫2.48B', change = '+18.2%', note = 'so với tháng trước', icon = <RiCheckLine />, trend = [18, 31, 25, 22, 39, 48, 42, 58], changeTone,
}: {
  label?: string; value?: string; change?: string; note?: string; icon?: ReactNode;
  /** Pass [] when there is no time series: the sparkline row is dropped. */
  trend?: number[];
  /** Override the automatic up/down tone, e.g. 'category' for plain counts. */
  changeTone?: 'info' | 'success' | 'warning' | 'danger' | 'category';
}) {
  const decrease = change.trim().startsWith('-');
  const decreaseIsFavorable = /chi phí|chi tiêu|trễ|lỗi/i.test(label);
  const tone = changeTone ?? ((decreaseIsFavorable ? decrease : !decrease) ? 'success' : 'danger');
  return <article className="application-kpi" data-trend={trend.length ? undefined : 'none'}>
    <header><span className="application-kpi__icon" aria-hidden="true">{icon}</span><span>{label}</span><VaultBadge tone={tone}>{change}</VaultBadge></header>
    <strong>{value}</strong>
    <small>{note}</small>
    {trend.length > 0 && <VaultSparkline label={`Xu hướng ${label}`} data={trend} tone={tone === 'danger' || tone === 'success' ? tone : 'category'} />}
  </article>;
}

