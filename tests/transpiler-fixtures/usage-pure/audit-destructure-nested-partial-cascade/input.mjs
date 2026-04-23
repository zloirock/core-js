// 3-level nest with siblings at the middle level: `{ self: { Array: { from }, Set } }`.
// `from` flattens to `const from = _Array$from`; inner `{from}` pattern empties fully but
// middle pattern retains `Set`, so the outer `self` property is NOT removed - partial cascade
// stops at the first non-empty pattern
const { self: { Array: { from }, Set } } = globalThis;
from(xs);
new Set();
