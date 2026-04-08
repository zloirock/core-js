import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function dec(v: any) {
  return (_: any) => _;
}
class Box {
  @dec((arr: string[]) => _atMaybeArray(arr).call(arr, 0))
  method() {}
}