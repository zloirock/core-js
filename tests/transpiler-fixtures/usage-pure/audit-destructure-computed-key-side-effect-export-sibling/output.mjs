import _Array$from from "@core-js/pure/actual/array/from";
// An exported pattern combines an effectful static key and a native sibling.
// The key effect runs before the static binding, both f and isArray stay exported,
// and the native sibling is read from the original receiver.
const _ref = Array,
  f = (effectful(), _Array$from),
  {
    isArray
  } = _ref;
export { f, isArray };