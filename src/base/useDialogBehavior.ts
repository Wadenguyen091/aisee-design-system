import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE = [
  'a[href]', 'button:not([disabled])', 'textarea:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Modal behaviour shared by every dialog in the library:
 * - Esc closes (handled in the capture phase so page shortcuts don't also fire)
 * - focus moves into the dialog on open and stays inside while Tab cycles
 * - focus returns to the element that opened it when the dialog closes
 */
export function useDialogBehavior(panelRef: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  // Remember the opener during render, before children with autoFocus move focus into the dialog.
  const wasOpen = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  if (open && !wasOpen.current && typeof document !== 'undefined') {
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
  wasOpen.current = open;

  useEffect(() => {
    if (!open) return;
    const opener = openerRef.current;
    const focusables = () => [...(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])]
      .filter((el) => el.offsetParent !== null || el === document.activeElement);

    const frame = requestAnimationFrame(() => {
      const panel = panelRef.current;
      if (!panel || panel.contains(document.activeElement)) return;
      // Start on the content, not on the close button, when there is something else to focus.
      const items = focusables();
      const target = items.find((el) => !el.hasAttribute('data-dialog-close')) ?? items[0];
      if (target) { target.focus(); return; }
      panel.tabIndex = -1;
      panel.focus();
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (event.isComposing) return;
        event.preventDefault();
        event.stopPropagation();
        closeRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKeyDown, true);
      if (opener && document.contains(opener)) opener.focus();
    };
  }, [open, panelRef]);
}
