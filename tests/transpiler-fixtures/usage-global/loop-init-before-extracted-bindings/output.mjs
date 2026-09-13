import "core-js/modules/es.object.keys";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// An effectful loop initializer observes the lexical binding before destructuring starts.
// The receiver evaluation must precede both the static and instance extractions.
const log = [];
function observe(read) {
  try {
    log.push(typeof read());
  } catch {
    log.push('tdz');
  }
}
let result;
for (const {
  Object: {
    keys
  },
  Array: {
    prototype: {
      at
    }
  }
} = (observe(() => keys), globalThis); !result;) result = [keys, at];
let single;
for (const {
  Array: {
    of
  }
} = (observe(() => of), globalThis); !single;) single = of(1);
export { log, result, single };