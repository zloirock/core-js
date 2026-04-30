import _Array$from from "@core-js/pure/actual/array/from";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
// for-init flatten + sibling IIFE with block-body arrow needing var _ref insert. asserts
// the insert-inside-overwrite collision behavior in for-init context where renderFlattened
// produces a single comma-list statement instead of multi-line splits
let result = 0;
for (let from = _Array$from, kls = (() => {
    var _ref;
    return _valuesMaybeArray(_ref = []).call(_ref);
  })(); result < 1; result++) {
  result = from([1]).length;
}
export { result };