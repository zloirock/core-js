import _globalThis from "@core-js/pure/actual/global-this";
export function renamedCtorSlot(flag) {
  if (flag) {
    var G = _globalThis;
  }
  const {
    Array: A
  } = G;
  return A.of(3);
}