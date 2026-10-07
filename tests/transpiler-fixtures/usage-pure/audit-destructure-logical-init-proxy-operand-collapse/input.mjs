// destructure off a `||` init whose left operand is a proxy-global member chain and whose retained
// sibling (`other`) keeps the init in the output: a left the build serves folds the init to that chain,
// its root substituted (`_globalThis.Array`, and `_globalThis.Number` - a global core-js extends in place),
// the right dead.
const { from, other } = globalThis.Array || Set;
from([1]);
console.log(other);
const { isInteger, other: kept } = globalThis.Number || Set;
isInteger(1);
console.log(kept);
