import { useLayoutEffect, useRef } from 'react';
import './vex-source/vx.js';
import './ApplicationVex.css';

export type VexComponentName =
  | 'Key' | 'Tag' | 'Tabs' | 'Chips'
  | 'Bubble' | 'Thread' | 'Composer' | 'Reasoning' | 'OrderCard' | 'HistoryRow' | 'History'
  | 'RiskArc' | 'Knob' | 'LimitSlider' | 'Toggle' | 'CurveEditor'
  | 'PanelHeader' | 'Panel' | 'IndexTile' | 'IndexGrid' | 'StatBlock' | 'HatchProgress'
  | 'MeterBars' | 'AreaChart' | 'StatusTable' | 'Pill' | 'Ledger' | 'HexGrid' | 'Scope'
  | 'Field' | 'Search' | 'Dropdown' | 'Mark' | 'Icon' | 'IconGrid';

type VexRuntime = Record<VexComponentName, (props?: Record<string, unknown>) => HTMLElement>;

declare global {
  interface Window {
    VEX?: VexRuntime;
    TDS?: VexRuntime;
  }
}

/**
 * Thin React adapter around the original VEX Tactical Design System runtime.
 * The component DOM and tokens remain owned by VEX; AISEE only hosts the specimen.
 */
export function VexSpecimen({ name, props = {}, className = '' }: {
  name: VexComponentName;
  props?: Record<string, unknown>;
  className?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const host = hostRef.current;
    const factory = window.VEX?.[name];
    if (!host || !factory) return;
    const specimen = factory(props);
    host.replaceChildren(specimen);
    return () => host.replaceChildren();
  }, [name, props]);

  return <div ref={hostRef} className={`vl vex-specimen ${className}`.trim()} data-vex-component={name} />;
}

