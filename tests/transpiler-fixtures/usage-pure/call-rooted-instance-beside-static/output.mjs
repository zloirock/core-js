import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
// A known realm result supplies both the nested instance read and its sibling.
const get = () => _globalThis;
const flat = _flatMaybeArray(_globalThis.Array.prototype);
const {
  Array: {
    isArray
  }
} = get();
export { flat, isArray };