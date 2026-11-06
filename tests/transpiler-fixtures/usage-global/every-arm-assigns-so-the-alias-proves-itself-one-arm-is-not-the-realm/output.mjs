import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// negatives
export function oneArmIsNotTheRealm(flag) {
  if (flag) {
    var N = globalThis;
  } else {
    var N = {};
  }
  return N.Array.of(3);
}