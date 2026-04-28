// nested fallback receiver: `cond1 ? (cond2 ? Array : Iterator) : Set`. Branch
// enumeration recurses into branches that are themselves fallback shapes so each leaf
// (Array, Iterator, Set) contributes its own polyfill - without recursion the inner
// conditional would collapse to a single consequent meta and Iterator's polyfill drops
const { from } = cond1 ? (cond2 ? Array : Iterator) : Set;
from([1, 2]);
