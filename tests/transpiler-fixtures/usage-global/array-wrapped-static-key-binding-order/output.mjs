import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A computed key under an array wrapper observes its binding before initialization.
// The static method is polyfilled after that key; the second element stays paired.
let seen;
function observe() {
  try {
    seen = typeof from;
  } catch (error) {
    seen = error.name;
  }
}
const [{
  [(observe(), 'from')]: from
}, other] = [Array, {}];
export const result = [seen, from([7]), other];