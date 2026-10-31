import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// Source contains an entry-style umbrella import (`core-js/actual/array/at`) in
// usage-pure mode: umbrella entries are neither pure imports nor `core-js/modules/*`
// targets, so they pass through to the bundler unchanged. Detected `.at` / `.findLast`
// / `.flat` calls still emit their own pure polyfill imports.
import 'core-js/actual/array/at';
const last = _at(arr).call(arr, -1);
const found = _findLastMaybeArray(list).call(list, x => x > 0);
const merged = _flatMaybeArray(a).call(a);
export { last, found, merged };