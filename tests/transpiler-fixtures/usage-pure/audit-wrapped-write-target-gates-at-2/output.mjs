import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const drr: number[] = [7];
(drr.at as any) = function () {
  return 2;
};
export const r4 = _atMaybeArray(drr).call(drr, 1);