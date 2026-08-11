import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// a memoized guard root whose source text REPEATS inside its own guarded branch: the second
// occurrence is a look-alike twin, not the root, and only its source position tells them apart.
// picking the memo slot by text alone hands the twin's emit to the guard - the guard then holds an
// index where the receiver belongs, and the twin keeps its raw, unpolyfilled call.
// a DISTINCT method per row on both sides of the pair, so a row that stops resolving leaves a hole
// in the import set rather than hiding behind a neighbour spelling the same name
export function pickLast(fn, o) {
  var _ref, _ref2;
  return null == (_ref = o.items) ? void 0 : _at(_ref).call(_ref, _findLastIndexMaybeArray(_ref2 = o.items).call(_ref2, fn));
}
export class Box {
  items = [];
  trim(fn) {
    var _ref3, _ref4;
    return null == (_ref3 = this.items) ? void 0 : _flatMaybeArray(_ref3).call(_ref3, _findIndexMaybeArray(_ref4 = this.items).call(_ref4, fn));
  }
}
export function padByNested(fn, o) {
  var _ref5, _ref6;
  return null == (_ref5 = o.text) ? void 0 : _padStartMaybeString(_ref5).call(_ref5, _flatMapMaybeArray(_ref6 = o.items).call(_ref6, fn).length);
}

// TWO twins past the root: each takes its own slot, and the ordinals must not drift
export function sumTwins(fn, o) {
  var _ref7, _ref8, _ref9;
  return null == (_ref7 = o.items) ? void 0 : _includes(_ref7).call(_ref7, _findLastIndexMaybeArray(_ref8 = o.items).call(_ref8, fn) + _findIndexMaybeArray(_ref9 = o.items).call(_ref9, fn));
}

// BOUNDARY: the root and the argument share a PREFIX but not the whole root text - the
// structural-boundary gate already rejects it, and the position gate agrees
export function siblingKey(fn, o) {
  var _ref10, _ref11;
  return null == (_ref10 = o.items) ? void 0 : _at(_ref10).call(_ref10, _findLastIndexMaybeArray(_ref11 = o.itemsExtra).call(_ref11, fn));
}

// NEGATIVE: no polyfilled call in the argument, so nothing competes for the slot
export function plainTail(o) {
  var _ref12;
  return null == (_ref12 = o.items) ? void 0 : _at(_ref12).call(_ref12, o.items.length - 1);
}