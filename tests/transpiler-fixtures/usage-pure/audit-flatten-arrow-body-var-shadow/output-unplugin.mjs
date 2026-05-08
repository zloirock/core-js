import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// Sibling IIFE shadows the global with a local `var globalThis`; flatten must respect that scope.
// Receiver-ref rewrite must skip identifiers shadowed by inner bindings, otherwise the IIFE breaks.
const from = _Array$from;
const val = (function () {
  var _ref;
  var globalThis = 'shadow';
  return _valuesMaybeArray(_ref = [globalThis]).call(_ref);
})();
export { from, val };