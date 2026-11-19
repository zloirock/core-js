import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
interface Homo {
  as: number[];
  bs: boolean[];
}
declare const h: Homo[keyof Homo];
export const r3 = _atMaybeArray(h).call(h, 1);