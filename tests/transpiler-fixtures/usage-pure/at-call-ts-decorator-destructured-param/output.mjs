import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
function dec(v: any) {
  return (_: any) => _;
}
@dec((({
  items
}: {
  items: number[];
}) => _atMaybeArray(items).call(items, 0))({
  items: [1, 2]
}))
class A {}