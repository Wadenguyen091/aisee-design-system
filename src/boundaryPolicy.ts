/**
 * AISEE boundary policy.
 *
 * A border is not a sixth Foundation. It is an application of Color + Weight
 * and must communicate a boundary or a state. Decorative outlines are not
 * part of the AISEE visual language.
 */
export const AISEE_BOUNDARY_POLICY = [
  {
    id: 'none',
    label: 'No border',
    use: 'Page, section, card, toolbar and primary action when spacing or surface already separates them.',
    token: 'none',
  },
  {
    id: 'control',
    label: 'Control boundary',
    use: 'Input, select and compact interactive control when its hit area would otherwise disappear.',
    token: 'var(--ds-boundary-control)',
  },
  {
    id: 'divider',
    label: 'Structural divider',
    use: 'One shared line between adjacent rows, columns or fixed application regions.',
    token: 'var(--ds-boundary-divider)',
  },
  {
    id: 'state',
    label: 'State boundary',
    use: 'Focus, selected and error states. The state replaces the resting boundary; it never stacks with it.',
    token: 'var(--ds-boundary-state)',
  },
] as const;

export type AiseeBoundaryRole = (typeof AISEE_BOUNDARY_POLICY)[number]['id'];
