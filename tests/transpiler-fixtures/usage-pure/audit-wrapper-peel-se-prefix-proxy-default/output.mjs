import _Array$from from "@core-js/pure/actual/array/from";
import _self from "@core-js/pure/actual/self";
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
function f({
  from: _unused,
  ...rest
} = (effect(), _self.Array)) {
  let from = _Array$from;
  return from([1]);
}
f();