import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise$reject from "@core-js/pure/actual/promise/reject";
// Multi-hop alias chains through inline-callee bodies must resolve recursively to the deepest constructor.
// Side-effecting prefix statements anywhere in the chain force a SE-wrapped emit instead of clean lift.
// Three shapes cover depth-2 clean, depth-3 clean (different constructor), and clean-outer/SE-inner.
const innerA = () => _Promise;
const outerA = () => innerA();
const a1 = _Promise$resolve(1);
const e3 = () => _Map;
const d2 = () => e3();
const c1 = () => d2();
const b1 = _Map.get('k');
let inc = 0;
const innerSE = () => {
  inc++;
  return _Promise;
};
const outerSE = () => innerSE();
const c2 = (outerSE(), _Promise$reject)(2);
export { a1, b1, c2, inc };