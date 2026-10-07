import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isSafeInteger from "@core-js/pure/actual/number/is-safe-integer";
const from = _Array$from;
// retained `??` init: the left operand is a proxy-global member chain, the right a bare global. a left the
// build serves folds the init to it, the right dead - `globalThis.Array`, and `globalThis.Number`, a global
// core-js extends in place
const {
  other
} = _globalThis.Array;
from([1]);
console.log(other);
const isSafeInteger = _Number$isSafeInteger;
const {
  other: kept
} = _globalThis.Number;
isSafeInteger(1);
console.log(kept);