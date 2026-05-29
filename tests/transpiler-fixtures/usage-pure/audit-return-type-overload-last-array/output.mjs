import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
// ReturnType<typeof fn> on an overloaded ambient function resolves against the LAST overload
// signature (TS rule). The last head returns number[], so the result narrows to Array and
// `.at(0)` / `.findIndex(...)` emit the Array variants.
declare function fn(x: string): string;
declare function fn(x: number): number[];
type R = ReturnType<typeof fn>;
declare const r: R;
const head = _atMaybeArray(r).call(r, 0);
const idx = _findIndexMaybeArray(r).call(r, n => n > 0);
export { head, idx };