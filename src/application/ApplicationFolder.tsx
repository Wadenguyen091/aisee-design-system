import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from 'react';

/**
 * Folder — the Board's one container object. Neutral (no per-folder hue): back panel with a right tab,
 * a paper sheet that rises on hover / drop, and a front face with title and count.
 * Shell 208×162 inside a 240 wrapper (Board drop zones depend on it). Hovering for 150ms opens a recap
 * of the first items above the folder. Composed only from tokens; the Board passes its own thumbnails.
 */
export type ApplicationFolderState = 'default' | 'hover' | 'selected' | 'dragOver';

export type ApplicationFolderRecap = {
  /** Up to 4 thumbnails (an image, or an icon for links, notes, docs). */
  thumbs: { key: string; node: ReactNode }[];
  /** One line, e.g. "3 images · 1 link". */
  summary: string;
};

export type ApplicationFolderProps = {
  title: string;
  count: number;
  /** Replaces the default “n mục” line when the folder is used as a feature illustration. */
  meta?: string;
  /** Optional product mark. Ordinary folders intentionally render without a monogram. */
  mark?: ReactNode;
  selected?: boolean;
  /** An item is being dragged over the folder: paper rises, the chip turns into +. */
  dropTarget?: boolean;
  recap?: ApplicationFolderRecap;
  /** Pins the visual state (specimens and reviews); the Board leaves it to pointer + props. */
  previewState?: ApplicationFolderState;
  /** Keep the recap open (specimens). */
  previewRecap?: boolean;
  onSelect?: (event: MouseEvent<HTMLDivElement>) => void;
  className?: string;
};

const SCALE: Record<ApplicationFolderState, number> = { default: 1, hover: 1.018, selected: 1.012, dragOver: 1.018 };

export function folderRecapSummary(groups: Record<string, number>) {
  return Object.entries(groups).filter(([, count]) => count > 0).slice(0, 3)
    .map(([group, count]) => `${count} ${group}${count === 1 ? '' : 's'}`).join(' · ');
}

export function ApplicationFolder({ title, count, meta, mark, selected = false, dropTarget = false, recap, previewState, previewRecap = false, onSelect, className = '' }: ApplicationFolderProps) {
  const [hovered, setHovered] = useState(false);
  const [recapOpen, setRecapOpen] = useState(false);
  const [recapBelow, setRecapBelow] = useState(false);
  const recapRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const state: ApplicationFolderState = previewState ?? (dropTarget ? 'dragOver' : selected ? 'selected' : hovered ? 'hover' : 'default');
  const isDrop = state === 'dragOver';
  const showRecap = (previewRecap || recapOpen) && !isDrop && !!recap && recap.thumbs.length > 0;

  // The recap opens above the folder; if the page chrome (topbar, canvas docks) would cover it there, it opens below.
  useLayoutEffect(() => {
    if (!showRecap || previewRecap) { setRecapBelow(false); return; }
    const panel = recapRef.current?.getBoundingClientRect();
    if (!panel) return;
    const covers = (rect: DOMRect) => rect.width > 0 && rect.left < panel.right && rect.right > panel.left && rect.top < panel.bottom && rect.bottom > panel.top;
    const chrome = Array.from(document.querySelectorAll('.application-topbar, .vault-topbar, .vault-command-dock, .vault-selection-dock, .vault-trash-dock'));
    if (panel.top < 64 || chrome.some(element => covers(element.getBoundingClientRect()))) setRecapBelow(true);
  }, [showRecap, previewRecap]);

  const enter = () => {
    setHovered(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setRecapOpen(true), 150);
  };
  const leave = () => {
    setHovered(false);
    setRecapOpen(false);
    setRecapBelow(false);
    if (timer.current) clearTimeout(timer.current);
  };

  return <div onClick={onSelect} onMouseEnter={enter} onMouseLeave={leave} className={`vault-folder ${className}`.trim()} data-interaction-state={state}>
    {showRecap && <div ref={recapRef} className="vault-folder__recap" data-placement={recapBelow ? 'below' : undefined}>
      <div className="vault-folder__recap-panel">
        <div className="vault-folder__recap-thumbs">{recap.thumbs.slice(0, 4).map(thumb => <div key={thumb.key} className="vault-folder__recap-thumb">{thumb.node}</div>)}</div>
        <p>{recap.summary}</p>
      </div>
    </div>}
    <div className="vault-folder__shell" style={{ transform: `scale(${SCALE[state]})` }}>
      <div data-folder-back className="vault-folder__back" />
      <div data-folder-tab className="vault-folder__tab" />
      <div data-folder-paper className="vault-folder__paper" />
      <div data-folder-face data-selection-shadow={state === 'selected' ? 'true' : undefined} className="vault-folder__face">
        {(isDrop || mark) && <span className="vault-folder__mark" aria-hidden="true">{isDrop ? '+' : mark}</span>}
        {!isDrop && !mark && <span className="vault-folder__symbol" aria-hidden="true"><i /><i /></span>}
        <span className="vault-folder__copy">
          <h3>{title}</h3>
          <small>{isDrop ? 'Thả vào đây' : meta ?? `${count.toLocaleString('vi-VN')} mục`}</small>
        </span>
      </div>
    </div>
  </div>;
}
