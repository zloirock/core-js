import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$all from "@core-js/pure/actual/promise/all";
// user explicitly imports a polyfill UID and accesses static methods on it. core-js-pure
// constructor modules typically don't re-export statics (Promise.resolve lives in a
// separate module), so direct `_Promise.resolve(1)` would crash at runtime. plugin must
// recognise `_Promise` as a proxy-global for the Promise constructor and rewrite static
// access to the dedicated module's UID. babel adapter exposes polyfillHint via injector
// closure; unplugin's estreeAdapter exposes the same via the per-transform lookup setter
import _Promise from '@core-js/pure/actual/promise/constructor';
const r = _Promise$resolve(1);
const j = _Promise$reject(2);
const a = _Promise$all([r]);
export { r, j, a };