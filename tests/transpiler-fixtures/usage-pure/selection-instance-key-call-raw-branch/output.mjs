import _entries from "@core-js/pure/actual/instance/entries";
import _keys from "@core-js/pure/actual/instance/keys";
import _values from "@core-js/pure/actual/instance/values";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
var _ref, _ref2, _ref3;
// A call of a key that is a static of a constructor core-js ships no replacement of and an instance method of
// other receivers (`entries`) over a selection the build does not decide: the identity guard serves the arm's
// static, and the raw branch invokes the instance dispatch's method with the captured selection as `this`
// (`.call`) - an absorbed `?.()` asking that method, a `?.` on the receiver hoisted over the whole guard
const pairs = {
  k: 1
};
export const viaCall = (_ref = source ?? Object, _ref === Object ? _Object$entries(pairs) : _entries(_ref).call(_ref, pairs));
export const viaOptionalCall = (_ref2 = source ?? Object, _ref2 === Object ? _Object$values(pairs) : _values(_ref2)?.call(_ref2, pairs));
export const viaOptionalMember = (_ref3 = shim || Object, null == _ref3 ? void 0 : _ref3 === Object ? _Object$keys(input) : _keys(_ref3).call(_ref3, input));