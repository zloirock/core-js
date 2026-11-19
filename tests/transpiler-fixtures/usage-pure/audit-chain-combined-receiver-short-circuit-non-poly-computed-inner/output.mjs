import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// a computed non-polyfilled inner keeps the bracket read under the same short-circuit
export function nonPolyComputedInner(o, k) {
  var _ref, _ref2, _ref3;
  return null == o || null == (_ref = o.b.c, _ref2 = _ref[k]) ? void 0 : _mapMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, x => x).length;
}