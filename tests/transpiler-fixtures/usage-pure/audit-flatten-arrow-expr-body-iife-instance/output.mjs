import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// multi-declarator: flattened `globalThis` proxy destructure plus a sibling whose
// initialiser is an arrow with an EXPRESSION body (not a block) returning an instance
// method call. the sibling's arrow body still needs receiver-rewrite handling for the
// flatten-introduced `_ref` binding
const from = _Array$from;
const kls = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, kls };