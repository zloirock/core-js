import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
const sink = {};
export function inForInLeftKey(obj) {
  let kIn = "trunc";
  for (sink[Math[kIn](1.5)] in obj) {
    kIn = "sign";
  }
}