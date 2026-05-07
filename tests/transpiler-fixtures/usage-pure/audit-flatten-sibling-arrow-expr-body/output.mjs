import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// multi-decl flatten + sibling arrow with expression body (no block) needing instance
// dispatch. arrow-body wrap inserts a NEW block + var _ref + return - these wraps land
// at the same byte range as the sibling, potentially overlapping the multi-decl overwrite
const from = _Array$from;
const val = (() => {
  var _ref;
  return _valuesMaybeArray(_ref = []).call(_ref);
})();
export { from, val };