import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// A plain call outside the seal evaluates its argument even when the lookup skipped.
export function read(holder) {
  var _ref;
  return ((holder == null ? void 0 : (_ref = holder.list, key(), _getIteratorMethod(_ref))) || 0).call(_ref, argument());
}