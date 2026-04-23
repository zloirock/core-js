import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set/constructor";
const from = _Array$from;
// 3-level nest with siblings at the middle level: `{ self: { Array: { from }, Set } }`.
// `from` flattens to `const from = _Array$from`; inner `{from}` pattern empties fully but
// middle pattern retains `Set`, so the outer `self` property is NOT removed - partial cascade
// stops at the first non-empty pattern
const Set = _Set;
from(xs);
new Set();