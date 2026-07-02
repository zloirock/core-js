import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Object$values from "@core-js/pure/actual/object/values";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// side effects harvested and re-emitted by a receiver collapse keep their own polyfillable
// content rewritten: the harvested subtrees are rescued from the collapse's visitor skip, so
// their queued rewrites compose into the re-emitted text (a bare re-emit shipped raw natives
// to targets without them). the collapsed root's eager import is also not injected when the
// collapse emits its own bindings, so no dead import line strands
let a1;
(a1 = _Array$of(1), _Symbol);
const iterator = _Symbol$iterator;
export const r1 = [typeof iterator, a1.length];
let c1 = 0;
(c1++, _Promise);
const resolve = _Promise$resolve;
export const r2 = [typeof resolve, c1];
let a2;
function sf() {
  return _globalThis;
}
;(a2 = _Object$entries({ q: 1 }), _Map);
const groupBy = _Map$groupBy;
export const r3 = [typeof groupBy, a2.length];
let a3;
function nf() {
  return _globalThis;
}
;(a3 = _Object$values({ w: 2 }), _Symbol);
const asyncIterator = _Symbol$asyncIterator;
export const r4 = [typeof asyncIterator, a3.length];
let a4;
_globalThis[(a4 = _Object$fromEntries([['z', 3]]), 'Array')];
const from = _Array$from;
export const r5 = [typeof from, a4.z];
let a5;
(a5 = _Array$from('ab'), _globalThis).Number;
const isInteger = _Number$isInteger;
export const r6 = [typeof isInteger, a5.length];
let a6;
(a6 = _Object$groupBy([1, 2], v => v % 2), _globalThis).Symbol;
const symFor = _Symbol$for;
export const r7 = [typeof symFor, typeof a6];