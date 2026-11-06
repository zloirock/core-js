import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
const arr: number[] = [1, 2, 3];
function dec(v: any) {
  return (_: any) => _;
}
@dec(_atMaybeArray(arr).call(arr, 0))
class A {
  // @ts-expect-error the decorator is an opaque read probe, not a callable tsc can check
  @dec(_atMaybeArray(arr).call(arr, 1))
  method() {}
}