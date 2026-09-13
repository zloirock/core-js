import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
// A var binding survives loop iterations: the first arm can initialize the second.
// That reaching realm value needs the static polyfill; pure keeps a constructor guard.
function read() {
  for (let i = 0; i < 2; i++) {
    if (!i) {
      var held = globalThis;
    } else {
      return held.Array.of(7);
    }
  }
}