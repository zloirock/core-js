import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// Nested literal defaults retain claimed statics and defer the native sibling until its source position.
const events = [];
function read({
  w: {
    v: {
      Array: {
        of,
        [(events.push('key'), 'from')]: from,
        length
      }
    }
  }
} = {
  w: {
    v: globalThis
  }
}) {
  return [of(4)[0], from([5])[0], length];
}
use(read(), events);