import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// An earlier static claim must not erase the surviving function-name read.
// Both leaves read the same realm constructor.
const {
  Array: {
    from,
    name
  }
} = globalThis;
use(from, name);