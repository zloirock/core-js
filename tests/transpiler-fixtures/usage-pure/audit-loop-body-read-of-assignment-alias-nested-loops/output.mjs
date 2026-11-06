import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
export function nestedLoops() {
  let x;
  x = _globalThis;
  for (let i = 0; i < 2; i++) {
    while (i) {
      i--;
      return _Object$fromEntries([]);
    }
  }
}