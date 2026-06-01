import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// early-exit guard via a switch whose stacked empty case falls through to a returning case
// (`case 1: case 2: return`): the switch counts as an unconditional exit so the code after
// the guard sees the narrowed array type and the array-specific at variant is selected
declare const k: number;
function f(x: string[] | number) {
  if (typeof x === 'number') {
    switch (k) {
      case 1:
      case 2:
        return 0;
      default:
        return 1;
    }
  }
  return _atMaybeArray(x).call(x, 0);
}
export { f };