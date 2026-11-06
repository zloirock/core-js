import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.self";
// A nested static assignment keeps its guarded source check before key effects.
// If the source is absent, neither the key nor either target write is reached.
// The receiver prefix runs once; the next key observes the preceding target write.
const events = [];
let from = 'old-from';
let keys = 'old-keys';
let result;
try {
  ({
    Array: {
      [(events.push('key'), 'from')]: from
    },
    [(events.push('x'.at(0), typeof from), 'Object')]: {
      keys
    }
  } = (events.push('source'), globalThis.window?.self));
  result = [from([7])[0], keys({
    x: 1
  })[0]];
} catch (error) {
  result = error.name;
}
export { events, result };

// A native member target does not turn the preceding Identifier slot into a native-first default.
const pureFrom = Array.from;
const box = {};
let method = 'old';
try {
  ({
    Array: {
      [(events.push('partial'), 'from')]: method
    },
    Object: {
      keys: box[events.push(method === pureFrom, 'y'.at(0)), 'value']
    }
  } = (events.push('partial-source'), globalThis.window?.self));
} catch (error) {
  events.push(error.name);
}
export const partial = [method === pureFrom, typeof box.value];