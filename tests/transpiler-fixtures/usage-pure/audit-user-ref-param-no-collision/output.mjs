import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref3, _ref4;
// user code already binds `_ref` / `_ref2`; plugin's UID allocator must pick a free slot
// (`_ref3`) for its own memoization. downstream ref-param normalization must not slice
// the user's bindings even though they share the plugin's prefix
const _ref = {
  items: [1, 2, 3]
};
const _ref2 = {
  items: [4, 5, 6]
};
const first = null == (_ref3 = _ref.items) ? void 0 : _atMaybeArray(_ref3)?.call(_ref3, 0);
const second = null == (_ref4 = _ref2.items) ? void 0 : _atMaybeArray(_ref4)?.call(_ref4, 0);
export { first, second };