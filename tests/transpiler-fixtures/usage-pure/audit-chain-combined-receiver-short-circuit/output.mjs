import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
// a receiver carrying its OWN live `?.` short-circuits the whole chain natively, so the
// combined dispatch tests it before the maybe-helper reads its member; folding it into the
// helper argument threw on a nullish receiver where native yields undefined
export function twoLive(a) {
  var _ref, _ref2, _ref3;
  return null == (_ref = a?.b?.c) || null == (_ref2 = _flatMaybeArray(_ref)) ? void 0 : _mapMaybeArray(_ref3 = _ref2.call(_ref)).call(_ref3, x => x).length;
}
// the live `?.` may sit deeper than the root, with the root itself plain
export function deeperSeated(a) {
  var _ref4, _ref5, _ref6;
  return null == (_ref4 = a.b?.c) || null == (_ref5 = _flatMaybeArray(_ref4)) ? void 0 : _mapMaybeArray(_ref6 = _ref5.call(_ref4)).call(_ref6, x => x).length;
}
// an optional CALL inside the receiver short-circuits the same way
export function callMid(a) {
  var _ref7, _ref8, _ref9;
  return null == (_ref7 = a?.get?.().rows) || null == (_ref8 = _flatMaybeArray(_ref7)) ? void 0 : _filterMaybeArray(_ref9 = _ref8.call(_ref7))?.call(_ref9, Boolean).length;
}
// NEGATIVE: parens TERMINATE the chain - the sealed `?.` no longer short-circuits what
// follows, so the receiver keeps its testless form and throws like native
export function parenSealed(a) {
  var _ref11, _ref10, _ref12;
  return null == (_ref10 = _flatMaybeArray(_ref11 = (a?.b).c)) ? void 0 : _mapMaybeArray(_ref12 = _ref10.call(_ref11)).call(_ref12, x => x).length;
}
// NEGATIVE: no live `?.` in the receiver - the helper's own member read must throw
export function plainReceiver(arr) {
  var _ref13, _ref14;
  return null == (_ref13 = _flatMaybeArray(arr)) ? void 0 : _mapMaybeArray(_ref14 = _ref13.call(arr)).call(_ref14, x => x).length;
}
// the same receiver rule on the NON-polyfilled inner path: the method read off the receiver
// memo short-circuits too, so a nullish receiver yields undefined instead of throwing
export function nonPolyInner(o) {
  var _ref15, _ref16, _ref17;
  return null == (_ref15 = o?.b.c, _ref16 = _ref15?.notPolyfilled) ? void 0 : _mapMaybeArray(_ref17 = _ref16.call(_ref15)).call(_ref17, x => x).length;
}
// a computed non-polyfilled inner keeps the bracket read under the same short-circuit
export function nonPolyComputedInner(o, k) {
  var _ref18, _ref19, _ref20;
  return null == (_ref18 = o?.b.c, _ref19 = _ref18?.[k]) ? void 0 : _mapMaybeArray(_ref20 = _ref19.call(_ref18)).call(_ref20, x => x).length;
}
// an ALREADY-optional method access keeps its single `?.` - the short-circuit rewrite must
// not double it
export function alreadyOptionalTail(o) {
  var _ref21, _ref22, _ref23;
  return null == (_ref21 = o?.b.c, _ref22 = _ref21?.notPolyfilled) ? void 0 : _mapMaybeArray(_ref23 = _ref22.call(_ref21)).call(_ref23, x => x).length;
}