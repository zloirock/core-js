// `import type { X }` declares a TYPE-only binding - no runtime presence. polyfill emit
// must still substitute `new X()` with the polyfill since the global isn't actually
// shadowed at runtime. estree-toolkit's binding tracker correctly classifies type-only
// imports as non-runtime; the global-resolution path passes through to inject `_Map`
import type { Map } from 'something';
new Map();
