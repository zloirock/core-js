import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// Other sources keep their rest exclusions and independently claimed statics.
// A `.self` hop in a logical's left lands on `_self` where the selection folds to that left, which the
// build serves (`.Array`, and `.Number`, a global core-js extends in place).
const _ref = _self.Array,
  from = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
from([1]);
const _ref2 = _self.Number,
  isInteger = _Number$isInteger,
  {
    isInteger: _unused2,
    ...others
  } = _ref2;
isInteger(1);