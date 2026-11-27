import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A keyof argument leaves the array receiver unchanged.
type Shape = {
  a: string;
  b: number;
};
declare const k: keyof Shape;
const arr: string[] = ['x'];
(_atMaybeArray(arr) || 0).call(arr, k as any);