import { join } from 'node:path';
import { ROOT, toPosix } from './paths.mjs';

const PACKAGES = toPosix(join(ROOT, 'packages'));
const MIN_CORE_JS_BYTES = 10_000;

function isWorkspaceCoreJsModule(id) {
  const file = toPosix(id);
  return file.startsWith(`${ PACKAGES }/core-js/`) || file.startsWith(`${ PACKAGES }/core-js-pure/`);
}

// Specifier text survives tree-shaking and legacy copies can carry their own payload.
// Count only rendered workspace polyfills.
export function assertWorkspacePayload({ chunk }, label) {
  const bytes = Object.entries(chunk.modules)
    .filter(([id]) => isWorkspaceCoreJsModule(id))
    .reduce((n, [, module]) => n + module.renderedLength, 0);
  if (bytes < MIN_CORE_JS_BYTES) throw new Error(`${ label }: only ${ bytes }b of workspace core-js reached the bundle`);
}
