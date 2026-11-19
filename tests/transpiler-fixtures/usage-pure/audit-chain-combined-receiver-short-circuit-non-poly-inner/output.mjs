import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// the same link rule on the NON-polyfilled inner path: the link is tested and the method is
// read plainly off the receiver memo, so a nullish receiver throws there as the source does
export function nonPolyInner(o) {
  var _ref, _ref2, _ref3;
  return null == o || null == (_ref = o.b.c, _ref2 = _ref.notPolyfilled) ? void 0 : _mapMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, x => x).length;
}