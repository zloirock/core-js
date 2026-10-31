import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
const brr: string[] = ["a"];
(brr.includes as any) = function () {
  return true;
};
export const r2 = _includesMaybeArray(brr).call(brr, "a");