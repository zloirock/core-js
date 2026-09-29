import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// a switch whose case bodies only `break` (not return) is NOT an unconditional exit, so the
// guard block does not exit and the value after it keeps its full union. Only its array arm
// needs an at polyfill; the number arm keeps its native throwing behavior.
declare const k: number;
function f(x: string[] | number) {
  if (typeof x === 'number') {
    switch (k) {
      case 1:
      case 2:
        break;
    }
  }
  return _atMaybeArray(x).call(x, 0);
}
export { f };