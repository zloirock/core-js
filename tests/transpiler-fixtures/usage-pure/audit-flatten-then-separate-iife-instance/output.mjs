import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// proxy flatten + separate (non-sibling) IIFE statement with instance dispatch. asserts
// the insert-inside-overwrite bug is gated on multi-decl mode (sibling participating in
// the same VariableDeclaration), not just any IIFE in a nearby statement
const from = _Array$from;
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };