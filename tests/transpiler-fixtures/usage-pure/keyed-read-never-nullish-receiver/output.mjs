import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
import _entriesMaybeArray from "@core-js/pure/actual/array/instance/entries";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSortedMaybeArray from "@core-js/pure/actual/array/instance/to-sorted";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
var _ref, _ref2, _ref3;
// An effectful computed key rejects a nullish receiver before its effect runs; a receiver that is never
// nullish needs no rejection: a literal, a never-written binding of one, a `??` whose right is one, a
// built-in constructor's prototype, a conditional of two such arms. One that may still be nullish keeps
// it: a written binding, one read before its initializer, a shadowed constructor, a conditional with a
// `null` or an opaque arm, an `&&`, an array-wrapper element, a namespace's prototype (`Math` has none).
let k = 0;
const list = [1, 2];
const maybe = pick();
export const viaLiteral = (_ref = [1, 2], k++, _atMaybeArray(_ref));
export const viaBinding = (k++, _flatMaybeArray(list));
export const viaFallback = (_ref2 = maybe ?? [3], k++, _includes(_ref2));
export const viaPrototype = (_ref3 = Array.prototype, k++, _findLastMaybeArray(_ref3));
export function written() {
  let x = [1];
  x = maybe;
  const w = null == x ? x[""] : (k++, _withMaybeArray(x));
  return w;
}
export function beforeInit() {
  const s = null == late ? late[""] : (k++, _toSortedMaybeArray(late));
  return s;
}
var late = [2, 1];
export function shadowed(Array) {
  const _ref4 = Array.prototype,
    r = null == _ref4 ? _ref4[""] : (k++, _toReversedMaybeArray(_ref4));
  return r;
}
export function eitherArm(c) {
  const _ref5 = c ? list : Array.prototype,
    e = (k++, _entriesMaybeArray(_ref5));
  return e;
}
export function selected(c) {
  const _ref6 = c ? [1] : null,
    t = null == _ref6 ? _ref6[""] : (k++, _toSplicedMaybeArray(_ref6));
  return t;
}
export function opaqueArm(c) {
  const _ref7 = c ? [1] : maybe,
    o = null == _ref7 ? _ref7[""] : (k++, _keys(_ref7));
  return o;
}
export function gated() {
  const _ref8 = maybe && [1],
    f = null == _ref8 ? _ref8[""] : (k++, _fillMaybeArray(_ref8));
  return f;
}
export function element() {
  const [_ref9, z] = [maybe, 1],
    c = null == _ref9 ? _ref9[""] : (k++, _copyWithinMaybeArray(_ref9));
  return [c, z];
}
export function namespace() {
  const _ref10 = Math.prototype,
    n = null == _ref10 ? _ref10[""] : (k++, _findLastIndexMaybeArray(_ref10));
  return n;
}