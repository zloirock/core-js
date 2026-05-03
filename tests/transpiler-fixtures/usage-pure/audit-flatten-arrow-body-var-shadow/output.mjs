import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
const from = _Array$from;
// multi-decl flatten + sibling arrow EXPRESSION body that needs block conversion (instance
// method dispatch generates `var _ref;`). inside the arrow's IIFE-wrapped scope a `var
// globalThis` shadows the outer global. the wrap by consumeRefBindingsInRange uses the
// raw original source, then polyfillSiblingReceiverRefs must NOT rewrite the inner ref
const val = function () {
  var _ref;
  var globalThis = 'shadow';
  return _valuesMaybeArray(_ref = [globalThis]).call(_ref);
}();
export { from, val };