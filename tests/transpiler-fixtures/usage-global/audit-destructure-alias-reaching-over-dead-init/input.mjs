// a binding reassigned through a const-array-init / computed-key destructure, then read in a closure
// the reassignment dominates: only the reaching value's static injects (M / N resolve to Array), and
// the dead init (Map) must NOT leak its own static - the reaching-value walk follows the same canon
let M = Map;
const arr = [Array];
[M] = arr;
const readM = () => { M.from([1, 2]); M.groupBy?.([], (x) => x); };
readM();

let N = Map;
const k = "x";
({ [k]: N } = { x: Array });
const readN = () => { N.of(1, 2); N.groupBy?.([], (x) => x); };
readN();
