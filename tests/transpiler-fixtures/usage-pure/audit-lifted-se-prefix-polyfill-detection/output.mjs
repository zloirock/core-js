import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `(Promise.resolve(1).then(noop), globalThis)` - SE prefix carrying polyfillable
// expressions inside the destructure init. when nested-proxy flatten lifts the SE prefix
// as a standalone statement (or preserves it via text in unplugin), the inner `Promise`
// reference must still receive its polyfill emission. seeding skippedNodes for the whole
// declarator (or full init) was over-aggressive: it suppressed polyfill detection for SE
// prefix expressions that are NOT consumed by the flatten
const noop = () => {};
_Promise$resolve(1).then(noop);
const from = _Array$from;
export { from };