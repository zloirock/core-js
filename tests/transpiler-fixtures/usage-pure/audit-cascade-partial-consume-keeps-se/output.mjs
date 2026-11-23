import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
var _ref;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
let effectRan = false,
  rest;
let from;
effectRan = true, {
  Array: {},
  ...(_ref = [from = _Array$from])[0]
} = _self, rest = _ref[0];
let counted = 0,
  keep;
let of;
counted++, {
  Array: {}
} = _self, of = _Array$of, {
  keep
} = _self;
export const r = [from, of, rest, keep, effectRan, counted];