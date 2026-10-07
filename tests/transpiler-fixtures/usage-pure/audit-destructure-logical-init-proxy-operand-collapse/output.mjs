import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
const from = _Array$from;
// destructure off a `||` init whose left operand is a proxy-global member chain and whose retained
// sibling (`other`) keeps the init in the output: a left the build serves folds the init to that chain,
// its root substituted (`_globalThis.Array`, and `_globalThis.Number` - a global core-js extends in place),
// the right dead.
const {
  other
} = _globalThis.Array;
from([1]);
console.log(other);
const isInteger = _Number$isInteger;
const {
  other: kept
} = _globalThis.Number;
isInteger(1);
console.log(kept);