import _Promise$all from "@core-js/pure/actual/promise/all";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// User imports a polyfill UID and then re-aliases it through a `const` chain before any
// static access. polyfillBindingHintLookup recognises the imported binding `_Promise` as
// a proxy-global for the Promise constructor; the alias-chain resolution path through the
// type resolver must propagate that hint when `P.resolve(...)` is rewritten. babel adapter
// exposes the same hint via injector closure - parity check. Each static uses a distinct
// method so the per-line dispatch is observable in the import set
import _Promise from '@core-js/pure/actual/promise/constructor';
const P = _Promise;
const Q = P;
const r = _Promise$resolve(1);
const j = _Promise$reject(2);
const a = _Promise$all([r, j]);
export { r, j, a };