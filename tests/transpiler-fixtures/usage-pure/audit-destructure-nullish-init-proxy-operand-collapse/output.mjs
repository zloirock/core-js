import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Set from "@core-js/pure/actual/set/constructor";
const from = _Array$from;
// retained `??` init: the left operand is a proxy-global member chain, the right a bare global.
// each operand is polyfilled in place (`_globalThis.Array ?? _Set`) so neither ReferenceErrors
const {
  other
} = _globalThis.Array ?? _Set;
from([1]);
console.log(other);