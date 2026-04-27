import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
// receiver inlining via call-expression resolution. resolveObjectName recursively walks:
// (1) direct IIFE arrow / function-expression with single-return body
// (2) identifier-bound arrow / function-expression called as `f()`
// (3) const-binding whose init is itself a call expression of the above shapes
// opaque callees (free Identifier `someFn`, params on the callee, multi-return blocks)
// stay raw - inline result would be ambiguous

'from' in someFn();
const xs = _Array$from(src);

// (1) direct IIFE - arrow with expression body
true;
const m = _Map$groupBy(items, fn);

// (1) direct IIFE - function expression with block body single return
true;
const o = _Object$fromEntries(entries);

// (2) identifier-bound arrow
const getArr = () => Array;
true;
const arr2 = _Array$from(src2);

// (3) call-expression init: const m2 = (() => Map)(); then 'fromAsync' in m2 walks m2's binding
const m2 = (() => Array)();
true;
const xs2 = _Array$fromAsync(src3);
export { xs, m, o, arr2, m2, xs2 };