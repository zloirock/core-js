import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// TS enum initializer with unary operator: the inner operand is still scanned for
// polyfill rewrites independently of the operator.
enum E {
  A = +1,
  B = -2,
  C = ~3,
}
const arr: number[] = [E.A, E.B, E.C];
_atMaybeArray(arr).call(arr, 0);