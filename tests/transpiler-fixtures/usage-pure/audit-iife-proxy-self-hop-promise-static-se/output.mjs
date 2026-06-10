import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// IIFE-rooted proxy chain with an intermediate `.self` hop before a static method
// (`(IIFE)().self.Promise.resolve`). same subsumption contract as the symbol-value form: the hop
// must not fire its own rewrite, the IIFE setup survives, the inner globalThis keeps its polyfill
let calls = 0;
const p = ((() => {
  calls++;
  return _globalThis;
})(), _Promise$resolve)(1);