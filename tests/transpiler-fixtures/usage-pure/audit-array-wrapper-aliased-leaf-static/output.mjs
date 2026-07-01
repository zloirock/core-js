import _Array$from from "@core-js/pure/actual/array/from";
// an ArrayPattern wrapper whose leaf is a const-ALIAS of the constructor (`const A = Array`, then `[A]`).
// the leaf must be canonicalized back to `Array` (via the object-name resolver's binding walk), else the static
// `from` drops. regression: a raw-name-only Identifier branch missed the alias - babel usage-pure dropped
// the substitution while unplugin rescued it (divergence); usage-global dropped the dep in both
const A = Array;
const from = _Array$from;
from([1, 2]);