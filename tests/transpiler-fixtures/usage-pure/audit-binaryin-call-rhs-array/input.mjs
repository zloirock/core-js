// receiver inlining for `key in CALL()` covers: (1) direct IIFE arrow / function-expression
// with a single-return body, (2) identifier-bound arrow / function-expression called as `f()`,
// (3) const-binding whose init is itself one of those call shapes. opaque callees (free
// Identifier, callee params, multi-return blocks) stay raw - inline result would be ambiguous

'from' in someFn();
const xs = Array.from(src);

// (1) direct IIFE - arrow with expression body
'groupBy' in (() => Map)();
const m = Map.groupBy(items, fn);

// (1) direct IIFE - function expression with block body single return
'fromEntries' in (function () { return Object; })();
const o = Object.fromEntries(entries);

// (2) identifier-bound arrow
const getArr = () => Array;
'from' in getArr();
const arr2 = Array.from(src2);

// (3) call-expression init: const m2 = (() => Map)(); then 'fromAsync' in m2 walks m2's binding
const m2 = (() => Array)();
'fromAsync' in m2;
const xs2 = Array.fromAsync(src3);

export { xs, m, o, arr2, m2, xs2 };
