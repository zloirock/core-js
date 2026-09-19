// trigger host forms beyond plain statements: a for-of HEAD has no init and never
// anchors; while-body / labeled-if bodyless slots keep single-statement renders unbraced;
// a switch-case consequent anchors like any statement slot
for (const { Map: { customF } } of items) use(customF);
let c1, c2, c3;
while (cond()) ({ Map: { custom: c1 } } = globalThis);
outer: if (cond) ({ Promise: { custom: c2 } } = globalThis);
switch (x) { case 1: ({ Iterator: { custom: c3 } } = globalThis); break; }
// a block-scoped statement position with a var binding escaping the block
{ var { WeakMap: { custom: c4 } } = globalThis; }
console.log(c1, c2, c3, c4);
