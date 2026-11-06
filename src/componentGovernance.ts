import raw from './component-intake.manifest.json';

export type ComponentLayer = 'base' | 'application' | 'feature' | 'screen' | 'specimen';
export type ComponentRelationship = 'candidate' | 'composition' | 'replace';
export type ComponentGovernanceStatus = 'linked' | 'proposed' | 'review';

export interface ComponentOrigin {
  sourceFile: string;
  owner: string;
  defaultLayer: ComponentLayer;
  target: string;
}

export interface ComponentMapping {
  source: string;
  target: string;
  relationship: ComponentRelationship;
  status: ComponentGovernanceStatus;
}

export interface ComponentIntakeManifest {
  version: 1;
  sourceApplication: 'aisee-core';
  sourceRepository: string;
  policy: string;
  origins: ComponentOrigin[];
  componentMappings: ComponentMapping[];
}

export const componentIntakeManifest = raw as ComponentIntakeManifest;

export const componentOriginFor = (sourceFile: string) =>
  componentIntakeManifest.origins.find((entry) => entry.sourceFile === sourceFile);

export const componentMappingFor = (source: string) =>
  componentIntakeManifest.componentMappings.find((entry) => entry.source === source);
