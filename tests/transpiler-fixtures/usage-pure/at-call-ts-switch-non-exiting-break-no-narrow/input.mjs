// a switch whose case bodies only `break` (not return) is NOT an unconditional exit, so the
// guard block does not exit and the value after it keeps its full union - no array narrow is
// applied and the generic at variant is used
declare const k: number;
function f(x: string[] | number) {
  if (typeof x === 'number') {
    switch (k) {
      case 1:
      case 2: break;
    }
  }
  return x.at(0);
}
export { f };
