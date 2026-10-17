import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// NEGATIVE: parens TERMINATE the chain - the sealed `?.` no longer short-circuits what
// follows, so the receiver keeps its testless form and throws like native
export function parenSealed(a) {
  var _ref2, _ref, _ref3;
  return null == (_ref = _flatMaybeArray(_ref2 = (a?.b).c)) ? void 0 : _mapMaybeArray(_ref3 = _ref.call(_ref2)).call(_ref3, x => x).length;
}