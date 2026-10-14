import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// a receiver carrying its OWN live `?.` short-circuits the whole chain at that link, so the
// combined dispatch tests the link's object before the maybe-helper reads the receiver past it;
// a receiver that comes out nullish below the link still throws at that read, as native does
export function twoLive(a) {
  var _ref, _ref3, _ref2, _ref4;
  return null == (_ref = a?.b) || null == (_ref2 = _flatMaybeArray(_ref3 = _ref.c)) ? void 0 : _mapMaybeArray(_ref4 = _ref2.call(_ref3)).call(_ref4, x => x).length;
}
// the live `?.` may sit deeper than the root, with the root itself plain
export function deeperSeated(a) {
  var _ref5, _ref7, _ref6, _ref8;
  return null == (_ref5 = a.b) || null == (_ref6 = _flatMaybeArray(_ref7 = _ref5.c)) ? void 0 : _mapMaybeArray(_ref8 = _ref6.call(_ref7)).call(_ref8, x => x).length;
}
// an optional CALL inside the receiver short-circuits the same way
export function callMid(a) {
  var _ref9, _ref11, _ref10, _ref12;
  return null == (_ref9 = a?.get) || null == (_ref10 = _flatMaybeArray(_ref11 = _ref9.call(a).rows)) ? void 0 : _filterMaybeArray(_ref12 = _ref10.call(_ref11))?.call(_ref12, Boolean).length;
}
// NEGATIVE: parens TERMINATE the chain - the sealed `?.` no longer short-circuits what
// follows, so the receiver keeps its testless form and throws like native
export function parenSealed(a) {
  var _ref14, _ref13, _ref15;
  return null == (_ref13 = _flatMaybeArray(_ref14 = (a?.b).c)) ? void 0 : _mapMaybeArray(_ref15 = _ref13.call(_ref14)).call(_ref15, x => x).length;
}
// NEGATIVE: no live `?.` in the receiver - the helper's own member read must throw
export function plainReceiver(arr) {
  var _ref16, _ref17;
  return null == (_ref16 = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref17 = _ref16.call(arr)).call(_ref17, x => x).length;
}
// the same link rule on the NON-polyfilled inner path: the link is tested and the method is
// read plainly off the receiver memo, so a nullish receiver throws there as the source does
export function nonPolyInner(o) {
  var _ref18, _ref19, _ref20;
  return null == o || null == (_ref18 = o.b.c, _ref19 = _ref18.notPolyfilled) ? void 0 : _mapMaybeArray(_ref20 = _ref19.call(_ref18)).call(_ref20, x => x).length;
}
// a computed non-polyfilled inner keeps the bracket read under the same short-circuit
export function nonPolyComputedInner(o, k) {
  var _ref21, _ref22, _ref23;
  return null == o || null == (_ref21 = o.b.c, _ref22 = _ref21[k]) ? void 0 : _mapMaybeArray(_ref23 = _ref22.call(_ref21)).call(_ref23, x => x).length;
}
// an ALREADY-optional method access keeps its single `?.` - the short-circuit rewrite must
// not double it
export function alreadyOptionalTail(o) {
  var _ref24, _ref25, _ref26;
  return null == (_ref24 = o?.b.c, _ref25 = _ref24?.notPolyfilled) ? void 0 : _mapMaybeArray(_ref26 = _ref25.call(_ref24)).call(_ref26, x => x).length;
}