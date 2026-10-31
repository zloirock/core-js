import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// an ALREADY-optional method access keeps its single `?.` - the short-circuit rewrite must
// not double it
export function alreadyOptionalTail(o) {
  var _ref, _ref2, _ref3;
  return null == (_ref = o?.b.c, _ref2 = _ref?.notPolyfilled) ? void 0 : _mapMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, x => x).length;
}