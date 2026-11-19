import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _includes from "@core-js/pure/actual/instance/includes";
// TWO twins past the root: each takes its own slot, and the ordinals must not drift
export function sumTwins(fn, o) {
  var _ref, _ref2, _ref3;
  return null == (_ref = o.items) ? void 0 : (_includes(_ref) || 0).call(_ref, _findLastIndexMaybeArray(_ref2 = o.items).call(_ref2, fn) + _findIndexMaybeArray(_ref3 = o.items).call(_ref3, fn));
}