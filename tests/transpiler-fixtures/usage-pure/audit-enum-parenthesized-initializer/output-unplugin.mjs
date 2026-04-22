import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
enum E {
  A = (1 + 2),
  B = (3 + 4),
}
const arr: number[] = [E.A, E.B];
_atMaybeArray(arr).call(arr, 0);