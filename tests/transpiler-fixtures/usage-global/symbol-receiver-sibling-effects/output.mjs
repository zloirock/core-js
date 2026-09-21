import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested iterator read keeps the full initializer once, including sibling effects.
let count = 0;
const hit = () => ++count;
const {
  w: {
    [Symbol.iterator]: method
  },
  z
} = {
  z: (hit(), 1),
  w: (hit(), globalThis)
};
use(method, z, count);