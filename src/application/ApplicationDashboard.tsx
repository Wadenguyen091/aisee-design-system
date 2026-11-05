import { useState, type ReactNode } from 'react';
import {
  RiArrowRightDownLine, RiArrowRightUpLine, RiBankCardLine, RiBriefcase4Line, RiCalendarLine, RiCarLine,
  RiCheckboxCircleLine, RiCupLine, RiDownloadLine, RiFileList3Line, RiFolder3Line, RiMoneyDollarCircleLine,
  RiSendPlaneLine, RiServerLine, RiShoppingBag3Line, RiTeamLine, RiTimeLine, RiWallet3Line,
} from '@remixicon/react';
import { VaultAvatar, VaultBadge, VaultButton, VaultButtonGroup, VaultProgress } from '../base/VaultControls';
import { VaultBarList, VaultColumnChart, VaultLineChart, VaultRadialGauge } from '../base/VaultCharts';
import { ApplicationDashboardCard } from './ApplicationComponents';
import './ApplicationComponents.css';

type Range = '7d' | '30d' | 'q';
const RANGE_OPTIONS: Array<{ value: Range; label: string }> = [{ value: '7d', label: '7 ngày' }, { value: '30d', label: '30 ngày' }, { value: 'q', label: 'Quý' }];

/* ----------------------------------------------------------------- Finance */

/** Finance overview built from standalone cards: 4 stat cards + a full-row cash-flow chart card that owns the range switch. */
export function ApplicationFinanceOverview() {
  const [range, setRange] = useState<Range>('30d');
  const income = range === '7d' ? 186 : range === 'q' ? 2460 : 820;
  const expense = range === '7d' ? 94 : range === 'q' ? 1310 : 412;
  const fmt = (value: number) => value >= 1000 ? `₫${(value / 1000).toFixed(2)}B` : `₫${value}M`;
  const flow = range === '7d' ? [12, 18, 9, 22, 30, 26, 34] : [120, 180, 150, 240, 210, 320, 408];
  return <ApplicationCardGrid>
    <ApplicationStatCard label="Số dư khả dụng" value="₫1.24B" change="+6.8%" note="tất cả tài khoản" icon={<RiWallet3Line />} trend={[0.92, 0.98, 1.02, 1.0, 1.1, 1.16, 1.2, 1.24]} />
    <ApplicationStatCard label="Thu" value={fmt(income)} change="+12.4%" note="so với kỳ trước" icon={<RiArrowRightUpLine />} trend={[60, 72, 68, 90, 84, 102, 110, 120]} />
    <ApplicationStatCard label="Chi phí" value={fmt(expense)} change="-3.1%" note="so với kỳ trước" icon={<RiArrowRightDownLine />} trend={[58, 54, 60, 52, 50, 49, 47, 46]} />
    <ApplicationStatCard label="Dòng tiền ròng" value={fmt(income - expense)} change="+18.0%" note="thu trừ chi" icon={<RiMoneyDollarCircleLine />} trend={flow} />
    <ApplicationCard span={4} title="Dòng tiền ròng" caption="Triệu đồng" action={<VaultButtonGroup value={range} onChange={setRange} label="Kỳ báo cáo" size="sm" options={RANGE_OPTIONS} />}>
      <VaultLineChart label="Dòng tiền ròng (₫M)" data={flow} highlightIndex={5} />
    </ApplicationCard>
  </ApplicationCardGrid>;
}

type Txn = { id: string; name: string; category: string; date: string; amount: number; status: 'paid' | 'pending' | 'failed'; icon: ReactNode };
const TXNS: Txn[] = [
  { id: 't1', name: 'SALA — đợt 2', category: 'Doanh thu dự án', date: '29 Oct', amount: 240_000_000, status: 'paid', icon: <RiBriefcase4Line /> },
  { id: 't2', name: 'Render farm', category: 'Hạ tầng', date: '28 Oct', amount: -18_400_000, status: 'paid', icon: <RiServerLine /> },
  { id: 't3', name: 'THACO — tạm ứng', category: 'Doanh thu dự án', date: '27 Oct', amount: 96_000_000, status: 'pending', icon: <RiBriefcase4Line /> },
  { id: 't4', name: 'Thiết bị studio', category: 'Mua sắm', date: '25 Oct', amount: -32_000_000, status: 'failed', icon: <RiShoppingBag3Line /> },
  { id: 't5', name: 'Team offsite', category: 'Phúc lợi', date: '24 Oct', amount: -6_200_000, status: 'paid', icon: <RiCupLine /> },
];
const money = (value: number) => `${value > 0 ? '+' : '−'}₫${(Math.abs(value) / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}M`;
const TXN_STATUS = { paid: { label: 'Đã thanh toán', tone: 'success' }, pending: { label: 'Chờ duyệt', tone: 'warning' }, failed: { label: 'Thất bại', tone: 'danger' } } as const;

/** Transactions with an income/expense switch. Amounts are tabular and right-aligned. */
export function ApplicationTransactionList() {
  const [kind, setKind] = useState<'all' | 'in' | 'out'>('all');
  const rows = TXNS.filter(row => kind === 'all' || (kind === 'in' ? row.amount > 0 : row.amount < 0));
  return <section className="application-panel is-framed">
    <header className="application-panel__header"><strong>Giao dịch gần đây</strong><VaultButtonGroup value={kind} onChange={setKind} label="Loại giao dịch" size="sm" options={[{ value: 'all', label: 'Tất cả' }, { value: 'in', label: 'Thu' }, { value: 'out', label: 'Chi' }]} /></header>
    <div className="application-list" role="list">
      {rows.map(row => <div role="listitem" className="application-list__row is-txn" key={row.id}>
        <span className="application-list__icon" data-tone={row.amount > 0 ? 'income' : 'expense'}>{row.icon}</span>
        <span className="application-list__copy"><strong>{row.name}</strong><small>{row.category} · {row.date}</small></span>
        <VaultBadge tone={TXN_STATUS[row.status].tone}>{TXN_STATUS[row.status].label}</VaultBadge>
        <span className="application-amount" data-sign={row.amount > 0 ? 'in' : 'out'}>{money(row.amount)}</span>
      </div>)}
    </div>
    <footer className="application-panel__footer"><span>{rows.length} giao dịch</span><VaultButton appearance="text" size="sm" icon={<RiFileList3Line />}>Sổ giao dịch</VaultButton></footer>
  </section>;
}

const BUDGETS = [
  { name: 'Hạ tầng & phần mềm', spent: 84, limit: 120, icon: <RiServerLine /> },
  { name: 'Thiết bị', spent: 112, limit: 120, icon: <RiShoppingBag3Line /> },
  { name: 'Di chuyển', spent: 18, limit: 40, icon: <RiCarLine /> },
  { name: 'Phúc lợi đội ngũ', spent: 36, limit: 48, icon: <RiTeamLine /> },
];

/** Budget per category: spent vs limit with a segmented meter; flags categories above 90%. */
export function ApplicationBudgetTracker() {
  return <section className="application-panel is-framed">
    <header className="application-panel__header"><strong>Ngân sách tháng 10</strong><small>₫250M / ₫328M</small></header>
    <div className="application-list">
      {BUDGETS.map(item => {
        const pct = Math.round(item.spent / item.limit * 100);
        const hot = pct >= 90;
        return <div className="application-list__row is-budget" key={item.name}>
          <span className="application-list__icon">{item.icon}</span>
          <span className="application-list__copy"><strong>{item.name}</strong><small>₫{item.spent}M / ₫{item.limit}M</small></span>
          <VaultProgress value={pct} label={`${item.name} ${pct}%`} />
          <span className="application-budget__pct" data-hot={hot || undefined}>{pct}%</span>
        </div>;
      })}
    </div>
  </section>;
}

/** Invoice card: status, client, amount, due date and the actions that move it forward. */
export function ApplicationInvoiceCard({ status = 'overdue' }: { status?: 'overdue' | 'sent' | 'paid' }) {
  const [state, setState] = useState(status);
  const meta = state === 'paid' ? { label: 'Đã thanh toán', tone: 'success' as const } : state === 'sent' ? { label: 'Đã gửi', tone: 'info' as const } : { label: 'Quá hạn 4 ngày', tone: 'danger' as const };
  return <article className="application-invoice">
    <header className="application-panel__header"><span><RiBankCardLine aria-hidden="true" /><code>INV-2026-118</code></span><VaultBadge tone={meta.tone}>{meta.label}</VaultBadge></header>
    <div className="application-invoice__body">
      <div className="application-invoice__client"><VaultAvatar name="THACO Auto" size="md" fallback="initials" /><span><strong>THACO Auto</strong><small>THACO Mobility · đợt 1/3</small></span></div>
      <strong className="application-invoice__amount">₫96.000.000</strong>
      <dl className="application-props is-compact">
        <div><dt>Phát hành</dt><dd>12 Oct 2026</dd></div>
        <div><dt>Đến hạn</dt><dd>26 Oct 2026</dd></div>
        <div><dt>VAT 10%</dt><dd>₫8.727.273</dd></div>
      </dl>
    </div>
    <footer className="application-panel__footer">
      {state === 'paid'
        ? <span className="application-invoice__done"><RiCheckboxCircleLine aria-hidden="true" />Đã ghi nhận 29 Oct</span>
        : <><VaultButton appearance="ghost" size="sm" icon={<RiSendPlaneLine />} onClick={() => setState('sent')}>Gửi nhắc</VaultButton><VaultButton priority="primary" tone="brand" size="sm" onClick={() => setState('paid')}>Ghi nhận thanh toán</VaultButton></>}
    </footer>
  </article>;
}


/* ------------------------------------------------------------ Dashboard card */

/**
 * Standalone dashboard card — NOT full-bleed. Each card is its own block on the canvas,
 * separated from its neighbours by a 16 gap. Same surface grammar as Dialog/Popover:
 * header tint fading into the surface, one 6% edge, 24 padding, no inner strokes.
 */
export function ApplicationCard({ title, caption, action, children, footer, span = 1, className = '', onSelect, ariaLabel, interactionRole = 'link', selected = false }: {
  title: ReactNode;
  caption?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Columns to span inside ApplicationCardGrid (1–4). */
  span?: 1 | 2 | 3 | 4;
  className?: string;
  /** Makes the whole card a keyboard-accessible entry point. Avoid interactive children when set. */
  onSelect?: () => void;
  ariaLabel?: string;
  interactionRole?: 'link' | 'tab';
  selected?: boolean;
}) {
  return <article
    className={`application-card ${onSelect ? 'is-interactive' : ''} ${className}`.trim()}
    data-span={span}
    role={onSelect ? interactionRole : undefined}
    tabIndex={onSelect ? 0 : undefined}
    aria-label={onSelect ? ariaLabel || String(title) : undefined}
    aria-selected={onSelect && interactionRole === 'tab' ? selected : undefined}
    aria-current={onSelect && interactionRole === 'link' && selected ? 'page' : undefined}
    onClick={onSelect}
    onKeyDown={onSelect ? (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      onSelect();
    } : undefined}
  >
    <header className="application-card__header"><div><strong>{title}</strong>{caption && <small>{caption}</small>}</div>{action}</header>
    <div className="application-card__body">{children}</div>
    {footer && <footer className="application-card__footer">{footer}</footer>}
  </article>;
}

/** Grid of separate dashboard cards: 4 columns, 16 gap, collapses to 2 / 1. */
export function ApplicationCardGrid({ children }: { children: ReactNode }) {
  return <div className="application-card-grid">{children}</div>;
}

/** KPI card: the KPI content of ApplicationDashboardCard, presented as a standalone card. */
export function ApplicationStatCard(props: Parameters<typeof ApplicationDashboardCard>[0]) {
  return <div className="application-card application-card--stat" data-span={1}><ApplicationDashboardCard {...props} /></div>;
}

/** Demo: a dashboard assembled only from standalone cards. */
export function ApplicationCardDashboardDemo() {
  const [range, setRange] = useState<Range>('30d');
  return <ApplicationCardGrid>
    <ApplicationStatCard label="Dự án đang chạy" value="13" change="+3" note="so với kỳ trước" icon={<RiFolder3Line />} trend={[6, 8, 7, 9, 11, 10, 12, 13]} />
    <ApplicationStatCard label="Doanh thu" value="₫2.48B" change="+18.2%" note="so với kỳ trước" icon={<RiMoneyDollarCircleLine />} />
    <ApplicationStatCard label="Chi phí vận hành" value="₫684M" change="-4.6%" note="dưới ngân sách" icon={<RiWallet3Line />} trend={[52, 48, 50, 44, 46, 40, 41, 38]} />
    <ApplicationStatCard label="Task trễ hạn" value="7" change="+2" note="cần xử lý tuần này" icon={<RiTimeLine />} trend={[3, 4, 3, 5, 4, 6, 5, 7]} />
    <ApplicationCard span={2} title="Đầu việc hoàn thành" caption="Theo tuần · 01–31 Oct" action={<VaultButtonGroup value={range} onChange={setRange} label="Khoảng thời gian" size="sm" options={RANGE_OPTIONS} />}>
      <VaultColumnChart label="Đầu việc hoàn thành theo tuần" data={[{ label: 'T1', value: 38 }, { label: 'T2', value: 54 }, { label: 'T3', value: 47 }, { label: 'T4', value: 66 }, { label: 'T5', value: 61 }, { label: 'T6', value: 82 }, { label: 'T7', value: 72 }]} highlightIndex={5} />
    </ApplicationCard>
    <ApplicationCard title="Mục tiêu quý" caption="Doanh thu Q4">
      <VaultRadialGauge label="Tiến độ mục tiêu quý" value={68} />
    </ApplicationCard>
    <ApplicationCard title="Hoạt động" action={<VaultBadge tone="success">Trực tiếp</VaultBadge>} footer={<VaultButton appearance="text" size="sm">Xem tất cả</VaultButton>}>
      <ul className="application-card__list">
        {[['Minh Anh', 'duyệt Moodboard', '5 phút'], ['Trung Le', 'tải Masterplan_v4', '32 phút'], ['Linh Tran', 'tạo task Tour 3D', '1 giờ']].map(([n, t, time]) => <li key={n}><VaultAvatar name={n} size="sm" /><span><b>{n}</b> {t}</span><small>{time}</small></li>)}
      </ul>
    </ApplicationCard>
    <ApplicationCard span={2} title="Khối lượng theo team" caption="% công suất">
      <VaultBarList label="Khối lượng theo team" rows={[{ label: 'Design', value: 86 }, { label: '3D', value: 72 }, { label: 'Dev', value: 64 }, { label: 'Content', value: 41 }]} />
    </ApplicationCard>
    <ApplicationCard span={2} title="Deadline sắp tới" action={<VaultButton appearance="text" size="sm">Lịch</VaultButton>}>
      <ul className="application-card__list">
        {[['Tour 3D SALA', 82, 'Hôm nay', 'danger'], ['THACO pitch deck', 64, '02 Nov', 'success'], ['Brand guideline v2', 40, '06 Nov', 'success']].map(([n, v, d, tone]) => <li key={n as string}><span><b>{n}</b></span><VaultProgress value={v as number} label={`${n} ${v}%`} /><VaultBadge tone={tone as 'danger' | 'success'}>{d}</VaultBadge></li>)}
      </ul>
    </ApplicationCard>
  </ApplicationCardGrid>;
}
