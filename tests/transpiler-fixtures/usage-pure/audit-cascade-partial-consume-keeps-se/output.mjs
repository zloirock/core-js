import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
var _ref, _ref2, _unused;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let effectRan = false,
  rest;
let from;
_ref = (effectRan = true, _self), _ref2 = _ref["Array"], from = _Array$from, _ref2, {
  Array: _unused,
  ...rest
} = _ref, _ref;
let counted = 0,
  keep;
let of;
({
  keep
} = (counted++, _self));
of = _Array$of;
export const r = [from, of, rest, keep, effectRan, counted];