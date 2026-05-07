import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// flatten + sibling with nested block-body IIFE deeper than one level. asserts the bug
// fires regardless of nesting depth, not just outermost block body
const from = _Array$from;
const kls = (() => {
  if (true) {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  }
  return null;
})();
export { from, kls };