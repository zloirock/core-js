// an ArrayPattern wrapper whose leaf is a const-ALIAS of the constructor (`const A = Array`, then `[A]`).
// the leaf must be canonicalized back to `Array` (via resolveObjectName's binding walk), else the static
// `from` drops. regression: a raw-name-only Identifier branch missed the alias - babel usage-pure dropped
// the substitution while unplugin rescued it (divergence); usage-global dropped the dep in both
const A = Array;
const [{ from }] = [A];
from([1, 2]);
