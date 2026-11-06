// A nested static and a constructor sibling both receive pure values through proxy hops.
const { self: { Array: { from }, Set } } = globalThis;
from(xs);
new Set();
