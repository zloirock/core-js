import "core-js/modules/es.object.assign";
import "core-js/modules/es.global-this";
export function noAlternate(flag) {
  if (flag) {
    var L = globalThis;
  }
  return L.Object.assign({}, {
    b: 2
  });
}