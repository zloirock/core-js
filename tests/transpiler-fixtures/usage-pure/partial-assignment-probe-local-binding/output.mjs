import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// Reading the partial assignment receiver must not rename its hoisted declaration
// to the existing lexical source binding.
const held = _globalThis.window?.Array;
let from, other;
from = (({} = held).from, _Array$from);
({
  other
} = held);
export { from, other };