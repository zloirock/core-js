import _Array$of from "@core-js/pure/actual/array/of";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref, _ref2;
// Different return values and an implicit undefined never prove one constructor.
// Capture the result once and use the polyfill only when its constructor identity matches.
export const mixed = (_ref = (() => {
  if (flag) return Array;
  return custom;
})(), _ref === Array ? _Array$of(3) : _ref.of(3));
export const absent = (_ref2 = (() => {
  if (flag) return Object;
})(), null == _ref2 ? void 0 : _ref2 === Object ? _Object$groupBy([1, 2], value => value % 2) : _ref2.groupBy([1, 2], value => value % 2));