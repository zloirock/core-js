import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref3;
// A computed-key destructure keeps its key effect and polyfilled read in the original declaration slot.
// Earlier and later siblings retain their order across ordinary, exported, and bodyless hosts.
const _ref = getArr();
const at = _at(_ref);
const {
  other
} = _ref;
const _ref2 = arr;
const f = null == _ref2 ? _ref2[""] : (e1(), _flatMaybeArray(_ref2));
export const findLast = _findLastMaybeArray(getList());
export const fm = (_ref3 = arr2, null == _ref3 ? _ref3[""] : (e2(), _flatMapMaybeArray(_ref3)));
const includes = _includes(getSet());
const _ref4 = arr3;
const tr = null == _ref4 ? _ref4[""] : (e3(), _toReversedMaybeArray(_ref4));
const {
  tail
} = obj; // A leading computed-key slot finishes before the next receiver is evaluated.
const _ref5 = arr4;
const ts = null == _ref5 ? _ref5[""] : (e4(), _toSplicedMaybeArray(_ref5));
const findLastIndex = _findLastIndexMaybeArray(getColl());
console.log(at, other, f, fm, findLast, includes, tr, tail, ts, findLastIndex);