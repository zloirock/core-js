// re-read-observability boundary across the remaining shapes: a member read under a binary operand
// (`Set.length + 1`) and a computed member access (`obj[Map]`) make the literal single-read-only -
// a SOLE binding still extracts it once (eliminate-residual), never as a second copy. a computed
// property's VALUE (`WeakSet`, identifier-only) stays freely copyable and substitutes like babel's
// re-traversed clone. distinct instance methods per line.
const obj = {};
const { y: { at: a } } = { y: [Set.length + 1] };
const { z: { includes: b } } = { z: [obj[Map]] };
const { w: { flat: c } } = { w: [{ ["k"]: WeakSet }] };
// an accessor DEFINITION is single-read-only the same way (a copy would re-fire on reads)
const { v: { keys: d } } = { v: [{ get g() { return Map; } }] };
// a member read inside a FUNCTION body is deferred, not re-evaluated at literal creation -
// the literal stays freely copyable
const { u: { values: e } } = { u: [() => Set.prototype] };
export const r = [a, b, c, d, e];
