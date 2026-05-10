import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// multiple `?.` segments in the chain: `(arr?.b?.c.includes)(1)`. each optional
// contributes its own null-check; outer paren-lookup memoizes the deepest receiver
// (arr?.b?.c) so the .call binds it correctly while throwing on any nullish hop
declare const arr: {
  b?: {
    c: number[];
  };
} | null;
const r = (null == (_ref = arr?.b) ? void 0 : _includesMaybeArray(_ref2 = _ref.c)).call(_ref2, 1);