import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A `[Symbol.iterator]` key beside several claimed statics and an object rest stays in the residual,
// keyed by the symbol's ponyfill, while each static extracts ahead of it in source order and stays
// excluded from the rest.
const from = _Array$from;
const of = _Array$of;
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