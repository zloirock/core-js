import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _toSplicedMaybeArray from "@core-js/pure/actual/array/instance/to-spliced";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a memo-bearing sibling claims the whole-declaration render; the SE-key trailing polyfill
// declarator anchored at the last declarator end must bake into that render, not crash it
const _ref = getArr();
const at = _at(_ref);
const {
  other
} = _ref;
const {
    [(e1(), 'flat')]: _unused
  } = arr,
  f = _flatMaybeArray(arr);
export const findLast = _findLastMaybeArray(getList());
export const {
    [(e2(), 'flatMap')]: _unused2
  } = arr2,
  fm = _flatMapMaybeArray(arr2);
const includes = _includes(getSet());
const {
  [(e3(), 'toReversed')]: _unused3
} = arr3;
const {
    tail
  } = obj,
  tr = _toReversedMaybeArray(arr3); // SE key FIRST: the pair appends after the claimed render, never inside its wrapped init
const {
  [(e4(), 'toSpliced')]: _unused4
} = arr4;
const findLastIndex = _findLastIndexMaybeArray(getColl()),
  ts = _toSplicedMaybeArray(arr4);
console.log(at, other, f, fm, findLast, includes, tr, tail, ts, findLastIndex);