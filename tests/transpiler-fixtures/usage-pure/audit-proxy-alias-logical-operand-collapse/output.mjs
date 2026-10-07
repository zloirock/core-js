import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// A const alias of the realm object follows the ordinary proxy-hop collapse inside
// a logical receiver: a left the build serves (`g.self.Array`, and `g.self.Number`, a global
// core-js extends in place) folds it, read as `g.Array` so a host without native self does not
// fail. The selected receiver is evaluated once for the polyfilled extraction and the remaining-key copy.
const g = _globalThis;
const _ref = g.Array,
  from = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
from([1]);
const _ref2 = g.Number,
  isInteger = _Number$isInteger,
  {
    isInteger: _unused2,
    ...others
  } = _ref2;
isInteger(1);