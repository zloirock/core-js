import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const g = _globalThis;
function withDefault({
  from: _unused,
  ...rest
} = g.Array) {
  let from = _Array$from;
  return from([1]);
}
withDefault();