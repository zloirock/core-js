import _Array$from from "@core-js/pure/actual/array/from";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// `(Promise.resolve(1).then(noop), globalThis)` - an SE prefix carrying polyfillable
// expressions inside the destructure init. when nested-proxy flatten lifts the SE prefix as a
// standalone statement (or preserves it via text in unplugin), the inner Promise reference
// must still get its polyfill emission. marking the whole declarator / init as skipped was
// over-aggressive and suppressed polyfill detection for SE-prefix exprs the flatten leaves behind
const noop = () => {};
_Promise$resolve(1).then(noop);
const from = _Array$from;
export { from };