import _Array$from from "@core-js/pure/actual/array/from";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
// flatten on inner `from` plus a sibling `[Symbol.iterator]: iter` computed key: the
// destructure splits into two extractions (`from` and `iter = _getIteratorMethod(obj)`).
// the receiver `obj` aliases `globalThis`, so the receiver slice must survive the rewrite
// while the unrelated `globalThis -> _globalThis` substitution still applies in its own statement
const obj = _globalThis;
const from = _Array$from;
const iter = _getIteratorMethod(obj);
console.log(from, iter);