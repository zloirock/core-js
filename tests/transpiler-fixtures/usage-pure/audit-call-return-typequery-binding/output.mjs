import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// `make: typeof helper` indirectly inherits `() => string[]` via the typeof query.
// Call-return resolution must follow the typeof binding so the result narrows to Array.
declare function helper(): string[];
declare const make: typeof helper;
const arr = make();
_atMaybeArray(arr).call(arr, 0);
_findLastMaybeArray(arr).call(arr, x => x);