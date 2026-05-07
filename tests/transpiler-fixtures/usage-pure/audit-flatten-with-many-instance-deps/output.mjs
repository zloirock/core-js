import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _keysMaybeArray from "@core-js/pure/actual/array/instance/keys";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
// flatten + sibling block-body IIFE with many instance methods needing var _ref. asserts
// the bug surface widens with each additional _ref-requiring transform inside the sibling
const from = _Array$from;
const kls = function () {
  var _ref, _ref2, _ref3;
  const a = _valuesMaybeArray(_ref = []).call(_ref);
  const b = _keysMaybeArray(_ref2 = []).call(_ref2);
  const c = _entriesMaybeArray(_ref3 = []).call(_ref3);
  return [a, b, c];
}();
export { from, kls };