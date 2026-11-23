import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// A known realm result supplies both the nested instance read and its sibling.
const get = () => _globalThis;
const _ref2 = get(),
  {
    Array: _ref
  } = _ref2;
const flat = _flatMaybeArray(_ref.prototype),
  {
    isArray
  } = _ref;
export { flat, isArray };