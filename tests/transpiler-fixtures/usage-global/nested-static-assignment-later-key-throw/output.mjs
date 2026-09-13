import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// A nested assignment writes its first target before evaluating the next outer key.
// An exception in that key keeps the completed write and leaves the next target untouched.
const events = [];
let from = 'old-from';
let keys = 'old-keys';
function nextKey() {
  events.push(typeof from);
  throw 'stop';
}
try {
  ({
    Array: {
      [(events.push('key'), 'from')]: from
    },
    [(nextKey(), 'Object')]: {
      keys
    }
  } = globalThis);
} catch (error) {
  events.push(error);
}
export const result = [events, typeof from, keys];