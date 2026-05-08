// Multi-hop alias chains through inline-callee bodies must resolve recursively to the deepest constructor.
// Side-effecting prefix statements anywhere in the chain force a SE-wrapped emit instead of clean lift.
// Three shapes cover depth-2 clean, depth-3 clean (different constructor), and clean-outer/SE-inner.
const innerA = () => Promise;
const outerA = () => innerA();
const a1 = outerA().resolve(1);
const e3 = () => Map;
const d2 = () => e3();
const c1 = () => d2();
const b1 = c1().get('k');
let inc = 0;
const innerSE = () => { inc++; return Promise; };
const outerSE = () => innerSE();
const c2 = outerSE().reject(2);
export { a1, b1, c2, inc };
