import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// The assignment replaces the enum member before the optional call reads it.
// The flattened array calls filter with the original callback.
enum Patched {
  MAP = 'map'
}
(Patched as any).MAP = 'filter';
export const r8 = null == (_ref = _flatMaybeArray(arr)) ? void 0 : (_filterMaybeArray(_ref2 = _ref.call(arr)) || 0).call(_ref2, f);