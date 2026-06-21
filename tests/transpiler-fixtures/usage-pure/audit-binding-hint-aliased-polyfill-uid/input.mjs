// User imports a polyfill UID and re-aliases it through a `const` chain before any static
// access. The imported binding `_Promise` is recognised as a proxy-global for the Promise
// constructor, and that hint must propagate through the alias chain when `P.resolve(...)`
// is rewritten. Each static uses a distinct method so per-line dispatch shows in the import set
import _Promise from '@core-js/pure/actual/promise/constructor';
const P = _Promise;
const Q = P;
const r = Q.resolve(1);
const j = Q.reject(2);
const a = Q.all([r, j]);
export { r, j, a };
