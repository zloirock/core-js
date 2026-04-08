import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function dec(v: any) {
  return (_: any) => _;
}
@dec(((): number => {
  const local: number[] = [1, 2, 3];
  return _atMaybeArray(local).call(local, 0);
})())
class A {}