// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
function outerEffect() { return 1; }
function innerEffect() { return 2; }
function midEffect() { return 3; }
const [{ Array: { from } }] = (outerEffect(), [(innerEffect(), globalThis)]);
export const viaDouble = from([1]);
const [[{ Array: { of } }]] = (outerEffect(), [(midEffect(), [(innerEffect(), globalThis)])]);
export const viaTriple = of(1, 2);
const keep = 1, [{ Object: { groupBy } }] = (outerEffect(), [(innerEffect(), globalThis)]), keep2 = 2;
export const viaSplit = groupBy([keep, keep2], x => x);
let fromAsync;
[{ Array: { fromAsync } }] = (outerEffect(), [(innerEffect(), globalThis)]);
export const viaAssignment = fromAsync;
