import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A computed-key destructure keeps its key effect and polyfilled read in the original declaration slot.
// Earlier and later siblings retain their order across ordinary, exported, and bodyless hosts.
const _ref = getArr();
const at = _at(_ref);
const {
  other
} = _ref;
const f = null == arr ? arr[""] : (e1(), _flatMaybeArray(arr));
export const findLast = _findLastMaybeArray(getList());
export const fm = null == arr2 ? arr2[""] : (e2(), _flatMapMaybeArray(arr2));
const includes = _includes(getSet());
const tr = null == arr3 ? arr3[""] : (e3(), _toReversedMaybeArray(arr3));
const {
  tail
} = obj; // A leading computed-key slot finishes before the next receiver is evaluated.
const ts = null == arr4 ? arr4[""] : (e4(), _toSplicedMaybeArray(arr4));
const findLastIndex = _findLastIndexMaybeArray(getColl());
console.log(at, other, f, fm, findLast, includes, tr, tail, ts, findLastIndex);