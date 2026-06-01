import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// static at a NON-zero index of a multi-element ArrayPattern (`[a, b, { from }]` -> init index 2):
// the index-aware descent picks `[1, 2, Array][2]` = Array, so `from` extracts to `_Array$from`
// while the `a` / `b` element bindings and the renamed `_unused` key survive in the residual
const [a, b, {
  from: _unused
}] = [1, 2, Array];
from([a, b]);