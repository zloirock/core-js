import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findIndexMaybeArray from "@core-js/pure/actual/array/instance/find-index";
// pickLastAmbientOverload: TS resolves ReturnType<typeof fn> against the LAST
// overload signature when fn is ambient with multiple `declare function` headers.
// here: last overload returns number[], earlier returns string. ReturnType should
// pick number[] - giving Array narrowing for .at(0).
declare function fn(x: string): string;
declare function fn(x: number): number[];
type R = ReturnType<typeof fn>;
declare const r: R;
const head = _atMaybeArray(r).call(r, 0);
const idx = _findIndexMaybeArray(r).call(r, n => n > 0);
export { head, idx };