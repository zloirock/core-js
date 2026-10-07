import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Number$isFinite from "@core-js/pure/actual/number/is-finite";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
// A TS wrapper around an init a static claim empties leaves with the value it wraps: what stays of the
// init - its effects - is spelled bare, its rescue asked of what the wrapper holds (a prefix keeps its
// effect alone). A declaration, an assignment and a bodyless slot alike. A left the build serves
// (`globalThis.Array`, and `globalThis.Number`, a global core-js extends in place) leaves its right dead.
const of = _Array$of;
let from: any;
log();
from = _Array$from;
(log(), _globalThis).Object;
const fromEntries = _Object$fromEntries;
if (ok) var fromAsync = _Array$fromAsync;
let hasOwn: any;
if (ok) log(), hasOwn = _Object$hasOwn;
if (ok) {
  (log(), _globalThis).Object;
  var entries = _Object$entries;
}
export { of, from, fromEntries, fromAsync, hasOwn, entries };
const isInteger = _Number$isInteger;
if (ok) var isFinite = _Number$isFinite;
export { isInteger, isFinite };