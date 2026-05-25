import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// optional-call IIFE returning `Promise`, then `.resolve(1)` on it. KNOWN SEMANTIC SHIFT:
// the source `?.()` short-circuits the whole chain when `fn` is null/undefined; the emit
// rewrites the receiver into a SequenceExpression and unconditionally calls
// `_Promise$resolve(1)`, so when `fn` is null the polyfilled output no longer returns
// undefined - it returns a resolved Promise. Accepted under the "polyfill always wins"
// design, but worth keeping as a regression marker if the design ever tightens.
let calls = 0;
const fn = () => {
  calls++;
  return _Promise;
};
const r = (fn?.(), _Promise$resolve)(1);
[r, calls];