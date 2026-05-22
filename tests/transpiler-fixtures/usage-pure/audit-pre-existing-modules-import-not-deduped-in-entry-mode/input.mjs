// Source contains an entry-style umbrella import (`core-js/actual/array/at`) in
// usage-pure mode: umbrella entries are neither pure imports nor `core-js/modules/*`
// targets, so they pass through to the bundler unchanged. Detected `.at` / `.findLast`
// / `.flat` calls still emit their own pure polyfill imports.
import 'core-js/actual/array/at';
const last = arr.at(-1);
const found = list.findLast(x => x > 0);
const merged = a.flat();
export { last, found, merged };
