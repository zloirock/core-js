// guards narrow a LAGGED alias binding (babel rebuilds it after the destructure-assignment
// rewrite): an asserts-predicate statement narrows the reassigned alias to the asserted
// array variant, and a typeof early exit narrows its sibling to the string variant - the
// guard test's scope-host anchor must resolve the same rebuilt binding as the use
declare function assertArr(x: unknown): asserts x is number[];
let F;
({ Map: F } = globalThis);
F = globalThis.data;
assertArr(F);
export const r1 = F.includes(3);
let G;
({ Map: G } = globalThis);
G = globalThis.data;
if (typeof G !== 'string') throw new Error('shape');
export const r2 = G.at(0);
