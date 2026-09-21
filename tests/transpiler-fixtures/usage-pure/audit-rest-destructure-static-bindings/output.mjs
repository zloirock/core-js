import _Array$from from "@core-js/pure/actual/array/from";
import _Set from "@core-js/pure/actual/set";
// Constructor rest uses the full index where a constructor entry exists.
// Other sources keep their rest exclusions and independently claimed statics.
const _ref = Array,
  from = null == _ref ? _ref[""] : _Array$from,
  {
    from: _unused,
    ...rest
  } = _ref;
const a = from([1]);
const {
  of: setOf,
  ...others
} = _Set;
const b = setOf(1, 2, 3);
export { a, rest, b, others };