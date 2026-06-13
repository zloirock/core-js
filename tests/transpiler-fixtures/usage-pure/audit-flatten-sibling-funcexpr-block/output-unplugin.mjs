import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// multi-decl flatten + sibling FunctionExpression with block body needing var _ref insert.
// asserts whether the var-decl insert collision affects FunctionExpression too (or only
// arrow with explicit block body)
const from = _Array$from;
const kls = (function () {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };