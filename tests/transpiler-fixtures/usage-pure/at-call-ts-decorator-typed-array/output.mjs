import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr: number[] = [1, 2, 3];
function dec(v: any) {
  return (_: any) => _;
}
@dec(_atMaybeArray(arr).call(arr, 0))
class A {
  @dec(_atMaybeArray(arr).call(arr, 1))
  method() {}
}