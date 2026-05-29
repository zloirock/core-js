import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
// `Parameters<typeof pluck<string>>[0]` - TS 4.7+ instantiation expression inside a type
// query. The type argument propagates to the parameter list, so the first parameter type is
// string[] and `.at` / `.findLastIndex` narrow to the Array variants.
declare function pluck<T>(items: T[], key: T): T[];
type FirstArg = Parameters<typeof pluck<string>>[0];
declare const arr: FirstArg;
const head = _atMaybeArray(arr).call(arr, 0);
const idx = _findLastIndexMaybeArray(arr).call(arr, s => s.length > 0);
export { head, idx };