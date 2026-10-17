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
// An effectful computed key rejects a nullish receiver before its effect runs; a receiver that is never
// nullish needs no rejection: a literal, a never-written binding of one, a `??` whose right is one, a
// built-in constructor's prototype, a conditional of two such arms. One that may still be nullish keeps
// it: a written binding, one read before its initializer, a shadowed constructor, a conditional with a
// `null` or an opaque arm, an `&&`, an array-wrapper element, a namespace's prototype (`Math` has none).
let k = 0;
const list = [1, 2];
const maybe = pick();
export const viaLiteral = (k++, _atMaybeArray([1, 2]));
export const viaBinding = (k++, _flatMaybeArray(list));
export const viaFallback = (k++, _includes(maybe ?? [3]));
export const viaPrototype = (k++, _findLastMaybeArray(Array.prototype));
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
  const _ref = Array.prototype,
    r = null == _ref ? _ref[""] : (k++, _toReversedMaybeArray(_ref));
  return r;
}
export function eitherArm(c) {
  const e = (k++, _entriesMaybeArray(c ? list : Array.prototype));
  return e;
}
export function selected(c) {
  const _ref2 = c ? [1] : null,
    t = null == _ref2 ? _ref2[""] : (k++, _toSplicedMaybeArray(_ref2));
  return t;
}
export function opaqueArm(c) {
  const _ref3 = c ? [1] : maybe,
    o = null == _ref3 ? _ref3[""] : (k++, _keys(_ref3));
  return o;
}
export function gated() {
  const _ref4 = maybe && [1],
    f = null == _ref4 ? _ref4[""] : (k++, _fillMaybeArray(_ref4));
  return f;
}
export function element() {
  const [, _ref5] = [maybe, 1],
    {} = maybe,
    c = (k++, _copyWithinMaybeArray(maybe)),
    z = _ref5;
  return [c, z];
}
export function namespace() {
  const _ref6 = Math.prototype,
    n = null == _ref6 ? _ref6[""] : (k++, _findLastIndexMaybeArray(_ref6));
  return n;
}