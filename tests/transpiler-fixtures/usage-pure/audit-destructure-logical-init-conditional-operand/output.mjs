import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
// A left the build serves off the realm folds its selection - `globalThis.Array`, and `globalThis.Number`,
// a global core-js extends in place - and the conditional or sequence operand of its right leaves with it.
const _ref = _globalThis.Array,
  from = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
const _ref2 = _globalThis.Array,
  of = _Array$of,
  {
    of: _unused2,
    ...others
  } = _ref2;
export { from, rest, of, others };
const _ref3 = _globalThis.Number,
  isInteger = _Number$isInteger,
  {
    isInteger: _unused3,
    ...props
  } = _ref3;
const _ref4 = _globalThis.Number,
  isFinite = _Number$isFinite,
  {
    isFinite: _unused4,
    ...more
  } = _ref4;
export { isInteger, props, isFinite, more };