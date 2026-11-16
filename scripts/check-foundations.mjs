import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const foundations = readFileSync(new URL('../src/foundations.ts', import.meta.url), 'utf8');
const boundaryPolicy = readFileSync(new URL('../src/boundaryPolicy.ts', import.meta.url), 'utf8');
const tokens = readFileSync(new URL('../src/tokens.css', import.meta.url), 'utf8');

const orderedGroups = [...foundations.matchAll(/id: '([^']+)'/g)].map(match => match[1]);
assert.deepEqual(
  orderedGroups,
  ['typography', 'spacing', 'color', 'radius', 'weight'],
  'AISEE Foundation order is a fixed product contract',
);

for (const contract of [
  '--ds-text-body-xs-size: 12px;',
  '--ds-space-1: 4px;',
  '--ds-color-canvas:',
  '--ds-radius-sm: 2px;',
  '--ds-weight-xs: 1px;',
]) {
  assert.ok(tokens.includes(contract), `Missing Foundation contract: ${contract}`);
}

const shadowValues = [...tokens.matchAll(/--ds-shadow-(?:overlay|dialog|subtle):\s*([^;]+);/g)].map(match => match[1].trim());
assert.ok(shadowValues.length === 3 && shadowValues.every(value => value === 'none'), 'AISEE does not use visual shadows');
for (const role of ['none', 'control', 'divider', 'state']) {
  assert.ok(boundaryPolicy.includes(`id: '${role}'`), `Missing boundary role: ${role}`);
}
for (const token of ['--ds-boundary-control:', '--ds-boundary-divider:', '--ds-boundary-state:']) {
  assert.ok(tokens.includes(token), `Missing boundary token: ${token}`);
}
console.log('AISEE Foundation contract passed: Typography → Spacing → Color → Radius → Weight.');

