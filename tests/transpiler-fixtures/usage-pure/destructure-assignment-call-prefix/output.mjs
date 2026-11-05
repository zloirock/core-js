import _Array$from from "@core-js/pure/actual/array/from";
// An indirect constructor call supplies a native residual after the served static leaf.
// The source prefix runs before both bindings even though the call itself stays with the residual.
let from, x;
effect();
from = _Array$from;
({
  x
} = (() => Array)());
use(from, x);