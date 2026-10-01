import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const from = _Array$from;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const {
  [_Symbol$iterator]: it,
  from: _unused,
  ...rest
} = _globalThis.Array;
it;
from([1]);
export { it, from, rest };