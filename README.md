# AISEE Design System

Base design knowledge, semantic tokens and React component contracts shared by AISEE and its Mini Apps.

## Structure

- `src/theme.css`: generated light/dark theme values.
- `src/tokens.css`: primitive and semantic contracts.
- `src/base`: reusable UI building blocks.
- `src/application`: composed application patterns.
- `src/tokens.manifest.json`: machine-readable token manifest.
- `AISEE_DESIGN_KNOWLEDGE.md`: design knowledge for humans and AI agents.
- `docs/`: extracted principles, color engine/variable rules and component-building knowledge.

## Knowledge handbook

- [Design principles](./docs/01-DESIGN-PRINCIPLES.md)
- [Color engine and variable naming](./docs/02-COLOR-ENGINE-AND-VARIABLES.md)
- [Component building guide](./docs/03-COMPONENT-BUILDING-GUIDE.md)

## Use from source

```tsx
import { VaultButton } from '@aisee/design-system';
import '@aisee/design-system/styles.css';
```

Mini Apps inherit the semantic and component contracts. They may override declared brand tokens, typography, radius, density and motion; they must not fork accessibility or interaction behavior.

AISEE Core component provenance is versioned in `src/component-intake.manifest.json`. Every local component file has an owner, layer and Design System target. Reusable components additionally receive an explicit mapping with one of three relationships: `composition`, `candidate` or `replace`.

## Validate

```bash
npm install
npm test
```
