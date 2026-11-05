import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { RiChat1Fill, RiQuillPenFill } from '@remixicon/react';
import { readableInk } from './colorMath';

/*
 * Custom cursor — the Vault presence cursor. One anatomy for every tool:
 *  · the same pointer arrow (20 box, tip exactly on the hotspot) in the person's identity colour,
 *    with a 1px surface halo so it reads on any canvas (no shadow);
 *  · a name label with Badge geometry (pill 24, 12/16, padding 8) in the same identity colour,
 *    readable ink, 16 / 16 from the hotspot. The active tool shows as a 16 icon inside the label
 *    (comment, pen) — the pointer itself never changes shape.
 * The hotspot is the component's origin: place it with a transform at the pointer.
 */

export type VaultCursorTool = 'select' | 'comment' | 'pen';

const TOOL_ICONS = { comment: RiChat1Fill, pen: RiQuillPenFill } as const;

/** Pointer arrow on a 20 grid, tip at (0,0) of the glyph box. */
function CursorArrow() {
  return <svg className="vault-cursor__glyph" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" focusable="false">
    <path d="M0 0V15.2L4.4 11.2L7.4 17.8L10.2 16.6L7.3 10.2H13.2Z" />
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
    style={{ '--vault-cursor-color': color, '--vault-cursor-ink': readableInk(color), ...style } as CSSProperties}
  >
    <CursorArrow />
    {showLabel && name && <span data-cursor-label className="vault-cursor__label">{ToolIcon && <ToolIcon />}{name}</span>}
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
