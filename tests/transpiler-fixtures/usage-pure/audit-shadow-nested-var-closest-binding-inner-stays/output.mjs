import _globalThis from "@core-js/pure/actual/global-this";
var A = _globalThis;
function innerFn() {
  {
    var A = 1;
  }
  return A;
}
export const innerStays = innerFn();