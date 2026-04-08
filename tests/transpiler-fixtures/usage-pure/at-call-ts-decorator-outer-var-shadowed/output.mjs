import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const arr: number[] = [1, 2, 3];
function dec(v: any) {
  return (_: any) => _;
}
@dec((() => {
  const arr: string = 'hello';
  return _atMaybeString(arr).call(arr, 0);
})())
class A {}