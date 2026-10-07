import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
// A `??` over a parenthesized `||` whose left the build serves (`globalThis.Array`, `globalThis.Map`, and
// `globalThis.Number`, a global core-js extends in place) folds the rest away, the inner `||` with it.
const _ref = _globalThis.Array,
  from = _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
const {
  groupBy,
  ...others
} = _Map;
export { from, rest, groupBy, others };
const _ref2 = _globalThis.Number,
  isInteger = _Number$isInteger,
  {
    isInteger: _unused2,
    ...props
  } = _ref2;
export { isInteger, props };