import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref2, _ref3;
// user-written `_ref` at outer scope - emitted polyfill refs must skip past it to a
// numbered slot rather than rename user's binding/references
let _ref = "user-value";
const a = _atMaybeArray(_ref2 = [1, 2, 3]).call(_ref2, -1);
const b = _atMaybeArray(_ref3 = [4, 5, 6]).call(_ref3, -1);
export { _ref, a, b };