import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
const from = _Array$from;
const of = _Array$of;
// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const {
  [_Symbol$iterator]: it,
  from: _unused,
  of: _unused2,
  ...rest
} = _globalThis.Array;
it;
from([1]);
of(2, 3);
export { it, from, of, rest };