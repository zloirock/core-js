import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
export function renamedCtorSlot(flag) {
  if (flag) {
    var G = globalThis;
  }
  const {
    Array: A
  } = G;
  return A.of(3);
}