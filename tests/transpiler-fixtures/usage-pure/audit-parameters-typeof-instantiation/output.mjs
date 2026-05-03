import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
// Parameters<typeof fn<string>> - TS 4.7+ instantiation expression. The TSTypeQuery
// arg carries typeArguments on its inner exprName. resolveParametersParams uses
// resolveTypeQueryBinding which only takes the bare param. Probe whether
// instantiation type-args propagate to params.
declare function pluck<T>(items: T[], key: T): T[];
type FirstArg = Parameters<typeof pluck<string>>[0];
declare const arr: FirstArg;
const head = _atMaybeArray(arr).call(arr, 0);
const idx = _findLastIndexMaybeArray(arr).call(arr, s => s.length > 0);
export { head, idx };