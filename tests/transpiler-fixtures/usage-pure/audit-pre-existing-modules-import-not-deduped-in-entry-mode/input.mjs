// Source already contains an entry-style core-js import (`actual/array/at`).
// In usage-pure, `scanExistingCoreJSImports` runs on `initFile` and processes
// `core-js/modules/*` (global) plus `@core-js/pure/...` (pure-import bindings).
// Entry-style umbrella imports (e.g. `core-js/actual/array/at`) are not module-level
// and not pure - confirm whether they are removed, retained, or trigger any state.
import 'core-js/actual/array/at';
const last = arr.at(-1);
const found = list.findLast(x => x > 0);
const merged = a.flat();
export { last, found, merged };
