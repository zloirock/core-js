import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
var _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let effectRan = false,
  rest;
let from;
effectRan = true, _self.Array, from = _Array$from, {
  Array: _unused,
  ...rest
} = _self;
let counted = 0,
  keep;
let of;
({
  keep
} = (counted++, _self));
of = _Array$of;
export const r = [from, of, rest, keep, effectRan, counted];