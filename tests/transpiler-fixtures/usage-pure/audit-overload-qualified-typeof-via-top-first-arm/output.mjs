import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a top-typed first arm (`unknown`) accepts every argument, so an undiscriminating arg still
// resolves the call to it - TS first-match
declare namespace NS2 {
  function w(x: unknown): number[];
  function w(x: string): string;
}
declare const f3: typeof NS2.w;
export const viaTopFirstArm = _atMaybeArray(_ref = f3(opaque)).call(_ref, 0);