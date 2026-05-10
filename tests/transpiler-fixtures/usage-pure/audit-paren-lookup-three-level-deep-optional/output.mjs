import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref;
// 3-level chain past optional: `(arr?.b.c.includes)(1)`. extractCheck walks through
// `?.b` to chainStart, deopt walks every continuation level back to `path`. emit must
// memoize `arr.b.c` (not just arr) so the deep access evaluates once
declare const arr: {
  b: {
    c: number[];
  };
} | null;
const r = (arr == null ? void 0 : _includesMaybeArray(_ref = arr.b.c)).call(_ref, 1);