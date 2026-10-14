// An effect buried in an array wrapper's element runs once, in source order, whatever host the
// destructure stands in. A loop head hands the claim a literal in the slot; beside an object rest the
// wrapper is left consuming the element, the static written from its own entry and the rest copied
// off the realm after it - in a loop head and in an assignment alike.
const seen = [];
const eff = t => (seen.push(t), t);
let out1;
for (const [{ Array: { from } }] = [(eff('a'), globalThis)]; !out1;) out1 = from;
let out2;
for (const [{ Array: { of }, ...rest2 }] = [(eff('b'), globalThis)]; !out2;) out2 = of;
let fa;
let rest3;
([{ Array: { fromAsync: fa }, ...rest3 }] = [(eff('c'), globalThis)]);
export { out1, out2, fa, rest3, seen };
