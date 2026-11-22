// a switch whose case bodies only `break` (not return) is NOT an unconditional exit, so the
// guard block does not exit and the value after it keeps its full union. Both the array and string arms implement at.
declare const k: number;
function f(x: string[] | string) {
  if (typeof x === 'string') {
    switch (k) {
      case 1:
      case 2: break;
    }
  }
  return x.at(0);
}
export { f };
