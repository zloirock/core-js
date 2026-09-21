import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An iterator extraction reads the nested receiver without replaying sibling effects.
let count = 0,
  method,
  z;
const hit = () => ++count;
({
  w: {
    [Symbol.iterator]: method
  },
  z
} = {
  z: (hit(), 1),
  w: (hit(), globalThis)
});
use(method, z, count);