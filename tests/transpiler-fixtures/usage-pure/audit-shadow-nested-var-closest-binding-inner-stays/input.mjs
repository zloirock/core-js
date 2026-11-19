var A = globalThis;
function innerFn() {
  { var A = 1; }
  return A;
}
export const innerStays = innerFn();
