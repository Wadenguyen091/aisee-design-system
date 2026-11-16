/**
 * AISEE Foundation contract.
 *
 * This order is product architecture, not page navigation. Every token and
 * component decision must resolve through one of these five groups.
 */
export const AISEE_FOUNDATION_GROUPS = [
  {
    id: 'typography',
    label: 'Typography',
    tokenPrefixes: ['--ds-font-family-', '--ds-text-', '--ds-font-size-', '--ds-line-height-'],
  },
  {
    id: 'spacing',
    label: 'Spacing',
    tokenPrefixes: ['--ds-space-', '--ds-spacing-', '--ds-control-height-', '--ds-icon-size-', '--ds-control-icon-'],
  },
  {
    id: 'color',
    label: 'Color Pallet / Color Application Variables',
    tokenPrefixes: ['--ds-primitive-', '--ds-color-'],
  },
  {
    id: 'radius',
    label: 'Radius',
    tokenPrefixes: ['--ds-radius-'],
  },
  {
    id: 'weight',
    label: 'Weight',
    tokenPrefixes: ['--ds-font-weight-', '--ds-weight-', '--ds-border-width-', '--ds-icon-stroke-', '--ds-focus-outline-width'],
  },
] as const;

export type AiseeFoundationGroup = (typeof AISEE_FOUNDATION_GROUPS)[number]['id'];

