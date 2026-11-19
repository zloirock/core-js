import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A `[Symbol.iterator]` key beside a claimed static and an object rest stays in the residual, keyed
// by the symbol's ponyfill and excluded from the rest, while the static extracts ahead of it.
const from = _Array$from;
const {
  [_Symbol$iterator]: it,
  from: _unused,
  ...rest
} = _globalThis.Array;
it;
from([1]);
export { it, from, rest };