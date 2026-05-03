// User has an existing canonical pure import (`import _Set from '@core-js/pure/actual/set'`).
// Plugin must not re-emit a duplicate `_Set` import; new instance polyfill imports for
// `flat` / `padStart` get their own canonical paths. `_ref`-emitting optional-chain
// rewrite must allocate a fresh ref past the import header.
import _Set from '@core-js/pure/actual/set';
const s = new _Set();
const x = arr?.flat?.();
const y = str?.padStart(8);
