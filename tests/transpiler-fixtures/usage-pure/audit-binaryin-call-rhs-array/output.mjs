import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// receiver inlining for `key in CALL()` covers: (1) direct IIFE arrow / function-expression
// with a single-return body, (2) identifier-bound arrow / function-expression called as `f()`,
// (3) const-binding whose init is itself one of those call shapes. opaque callees (free
// Identifier, callee params, multi-return blocks) stay raw - inline result would be ambiguous

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