import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _copyWithinMaybeArray from "@core-js/pure/actual/array/instance/copy-within";
// Double alias chain through polyfilled static method must still narrow receiver type.
// `const a = Array.from; const b = a;` then `b('x').at(-1)` -> resolver must walk both
// alias hops to recognise the call returns Array, picking `_atMaybeArray` not generic `_at`.
// Distinct methods (at, findLast, copyWithin) confirm that each call site independently
// resolves through the same chain.
const a = _Array$from;
const b = a;
const arr = b('hi');
_atMaybeArray(arr).call(arr, -1);
_findLastMaybeArray(arr).call(arr, x => x);
_copyWithinMaybeArray(arr).call(arr, 0, 1);