// Discarded receiver prefixes preserve their observable effects once.
// Effect-free reads need no replay; prefixes kept inside a live expression retain their source order.
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
