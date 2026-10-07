import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _self from "@core-js/pure/actual/self";
// A left the build serves leaves no other logical operand live: `globalThis.self.Array`, and
// `globalThis.self.Number`, a global core-js extends in place, land on the backed proxy root
// (`_self`) alone. The selected receiver is evaluated once for the polyfilled property and the
// copy of the remaining keys.
const g = _globalThis;
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