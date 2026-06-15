import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
// Mixed logical operands resolve per-operand: a direct non-pure proxy member collapses its hop
// (`globalThis.self.Array` -> `_globalThis.Array`), an alias pure-ctor operand whole-swaps via the
// natural visitor (`g.self.Set` -> `_Set`, left verbatim here so it does not fight the visitor), and
// a bare global -> its pure import (`Map` -> `_Map`). Exercises crash-safety for the alias pure-ctor.
const g = _globalThis;
const from = _Array$from;
const {
  from: _unused,
  ...rest
} = _globalThis.Array || _Set || _Map;
from([1]);