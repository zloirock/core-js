import _at from "@core-js/pure/actual/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// Source already contains an entry-style core-js import (`actual/array/at`).
// In usage-pure, `scanExistingCoreJSImports` runs on `initFile` and processes
// `core-js/modules/*` (global) plus `@core-js/pure/...` (pure-import bindings).
// Entry-style umbrella imports (e.g. `core-js/actual/array/at`) are not module-level
// and not pure - confirm whether they are removed, retained, or trigger any state.
import 'core-js/actual/array/at';
const last = _at(arr).call(arr, -1);
const found = _findLastMaybeArray(list).call(list, x => x > 0);
const merged = _flatMaybeArray(a).call(a);
export { last, found, merged };