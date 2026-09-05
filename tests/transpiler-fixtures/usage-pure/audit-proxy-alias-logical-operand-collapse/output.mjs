import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
// A const-alias proxy root with a `.self` hop in a LOGICAL operand must collapse the hop in the live
// operand (`g.self.Array` -> `g.Array`), like a bare receiver, so the evaluated operand never reads
// `g.self` (undefined on ie:11 / Node, throws before `||` short-circuits). Both emitters collapse.
const g = _globalThis;
const from = _Array$from;
const {
  from: _unused,
  ...rest
} = g.Array || _Set;
from([1]);