import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// static-method dispatch on a chain rooted in a side-effecting call buried under a SequenceExpression
// prefix: `(eff(), mk()).Array.from(x)`. the receiver chain collapses to the polyfill, but the prefix
// effect AND the root call must still run, in source order, ahead of the dispatch
const log = [];
function mk() {
  _pushMaybeArray(log).call(log, 'mk');
  return _globalThis;
}
const r = (_pushMaybeArray(log).call(log, 'pre'), mk(), _Array$from)([1, 2]);
export { r };