// Mixed logical operands resolve per-operand: a direct non-pure proxy member collapses its hop
// (`globalThis.self.Array` -> `_globalThis.Array`), an alias pure-ctor operand whole-swaps via the
// natural visitor (`g.self.Set` -> `_Set`, left verbatim here so it does not fight the visitor), and
// a bare global -> its pure import (`Map` -> `_Map`). Exercises crash-safety for the alias pure-ctor.
const g = globalThis;
const { from, ...rest } = globalThis.self.Array || g.self.Set || Map;
from([1]);
