import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { RiChat1Fill, RiQuillPenFill } from '@remixicon/react';

/*
 * Custom cursor — the Vault presence cursor. One anatomy for every tool:
 *  · the same pointer arrow (22 box, tip exactly on the hotspot) in the person's identity colour,
 *    with a 1px surface keyline so it reads on any canvas (no shadow);
 *  · a compact presence label with an identity edge, neutral surface and stable text contrast.
 *    The active tool shows as an icon inside the label
 *    (comment, pen) — the pointer itself never changes shape.
 * The hotspot is the component's origin: place it with a transform at the pointer.
 */

export type VaultCursorTool = 'select' | 'comment' | 'pen';

const TOOL_ICONS = { comment: RiChat1Fill, pen: RiQuillPenFill } as const;

/** Pointer arrow on a 22 grid, tip at (0,0) of the glyph box. */
function CursorArrow() {
  return <svg className="vault-cursor__glyph" viewBox="0 0 22 22" width="22" height="22" aria-hidden="true" focusable="false">
    <path d="M1 1.2V17.4L5.8 13.1L9 20.1L12.2 18.7L9.1 11.9H15.5Z" />
  </svg>;
}

export function VaultCursor({ color, name, tool = 'select', showLabel = true, className = '', style }: {
  /** The person's identity colour (data colour). */
  color: string;
  /** Label text; omit or set showLabel={false} for a bare pointer. */
  name?: ReactNode;
  tool?: VaultCursorTool;
  showLabel?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const ToolIcon = tool === 'select' ? null : TOOL_ICONS[tool];
  return <span
    className={`vault-cursor ${className}`.trim()}
    data-tool={tool}
    aria-hidden="true"
    style={{ '--vault-cursor-color': color, ...style } as CSSProperties}
  >
    <CursorArrow />
    {showLabel && name && <span data-cursor-label className="vault-cursor__label">{ToolIcon && <span className="vault-cursor__tool"><ToolIcon /></span>}<span>{name}</span></span>}
  </span>;
}

/**
 * Region that swaps the system pointer for VaultCursor: the native cursor is hidden inside,
 * the custom one follows the pointer and disappears when it leaves. Touch input keeps no cursor.
 */
export function VaultCursorArea({ color, name, tool = 'select', showLabel = true, children, className = '', style }: {
  color: string;
  name?: ReactNode;
  tool?: VaultCursorTool;
  showLabel?: boolean;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  const track = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') return;
    const box = areaRef.current?.getBoundingClientRect();
    if (box) setPoint({ x: event.clientX - box.left, y: event.clientY - box.top });
  };
  return <div
    ref={areaRef}
    className={`vault-cursor-area ${className}`.trim()}
    style={style}
    onPointerEnter={track}
    onPointerMove={track}
    onPointerLeave={() => setPoint(null)}
  >
    {children}
    {point && <VaultCursor color={color} name={name} tool={tool} showLabel={showLabel} style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0)` }} className="vault-cursor-area__cursor" />}
  </div>;
}
