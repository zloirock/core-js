// the HOST positions a kept proxy root can sit in. the rule is the same everywhere - the assignment stays
// as the root, its redundant proxy hops still drop - but each host reaches the collapse through its own
// emit path, so each is pinned separately: a `new` callee, a write target, a logical operand, a for-x
// head, a template hole and a spread argument. a `delete` names a SLOT: it lands on the run's root
// binding whatever the store holds, and the `?.` over the stored probe decides whether it happens.
let n;
export const newCallee = new (n = globalThis.window).self.Array(3);

let w;
(w = globalThis.window).self.Set = function () {};

let l;
export const logicalOperand = (l = globalThis.window)?.self.Array.prototype.flatMap || {};

let f;
for (const k in (f = globalThis.window)?.self.Array.prototype ?? {}) void k;

let t;
export const templateHole = `${ (t = globalThis.window)?.self.Array.prototype.includes.call([1], 1) }`;

let s;
export const spreadArg = Math.max(...((s = globalThis.window)?.self.Array.from?.([1, 2]) ?? [0]));

let d;
delete (d = globalThis.window)?.self.someUserKey;

export { w };
