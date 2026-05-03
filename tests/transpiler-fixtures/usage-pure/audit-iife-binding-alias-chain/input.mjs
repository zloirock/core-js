// inline-call resolution walks at most ONE binding-hop: const f = g; const g = () => Map;
// `f()` is NOT inlined because after dereferencing f's binding the new callee is still an
// Identifier (`g`), not an ArrowFunctionExpression. only direct-IIFE or single-hop alias
// (const h = () => Map; h()) inlines. lock current behaviour: receiver does NOT resolve
// to Map, so the prototype-method call falls through the maybe-instance path
const g = () => Map;
const f = g;
const out1 = f().has(1);
// single-hop alias with a pure expression body resolves and rewrites - no statements,
// nothing to preserve, the receiver call disappears into the polyfill replacement
const h = () => Promise;
const out2 = h().resolve(2);
// side-effect probe: block body with a prefix statement (`calls++`) before `return`.
// the receiver call MUST stay observable AND the static dispatch MUST be polyfilled.
// emit wraps the polyfill replacement in a SequenceExpression that re-emits the original
// receiver call: `k()` runs (calls reaches 1) and `_Promise$resolve(3)` is dispatched
let calls = 0;
const k = () => { calls++; return Promise; };
const out3 = k().resolve(3);
// SequenceExpression body `(calls++, Promise)` carries the side effect in the prefix.
// resolveObjectName does not unwrap SE tails through inline-call (SE-body returns the
// whole SE node, which has no objectName), so the receiver does not resolve to Promise
// and the call site stays as-is - safe miss vs unsafe rewrite. side effect preserved
// through the original `m()` call which still runs at the call site
const m = () => (calls++, Promise);
const out4 = m().reject(4);
export { out1, out2, out3, out4, calls };
