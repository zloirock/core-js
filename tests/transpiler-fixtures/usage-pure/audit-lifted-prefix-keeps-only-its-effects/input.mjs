// a lifted prefix keeps exactly what can be observed: the statement it becomes discards every value,
// so an effect-free element is a comma the source wrote rather than work it did, and a prefix with
// nothing to observe leaves no statement at all. the trim is one canon for every channel that lifts
// one - the whole-prefix one a discarded receiver takes, and the per-element one the surviving
// residual, the nested flatten, the array wrapper and the bodyless slot print.
function eff() {}
function eff2() {}
let a, b, c, d, e;
({ Map: a } = (0, globalThis));
({ Set: b } = (0, eff(), globalThis));
({ WeakMap: c } = (eff(), 0, globalThis));
({ WeakSet: d } = (eff(), eff2(), globalThis));
({ Promise: e } = (0, 1, globalThis));
var { Map: f, other } = (0, eff(), globalThis);
var { Array: { from: g } } = (0, eff(), globalThis);
const [{ Array: { of: h } }] = [(0, eff(), globalThis)];
if (1) var { Set: i, alsoOther } = (0, eff(), globalThis);
for (var { WeakSet: j, moreOther } = (0, eff(), globalThis), n = 0; n < 1; n++);
export const r = [a, b, c, d, e, f, other, g, h, i, alsoOther, j, moreOther];
