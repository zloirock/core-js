import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _self from "@core-js/pure/actual/self";
// assignment-cascade PARTIAL consume (a rest / non-consumed sibling keeps the residual): the
// init's side-effecting sequence prefix must survive in the rebuilt residual - only a FULL
// consume may discard the rebuilt init
let effectRan = false,
  rest;
let from;
var _unused;
({
  Array: _unused,
  ...rest
} = (effectRan = true, _self));
from = _Array$from;
let counted = 0,
  keep;
let of;
({
  keep
} = (counted++, _self));
of = _Array$of;
export const r = [from, of, rest, keep, effectRan, counted];