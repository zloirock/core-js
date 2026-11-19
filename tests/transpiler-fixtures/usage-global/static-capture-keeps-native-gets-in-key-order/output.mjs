import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
// The static reads and the computed key remain in order, including a dynamic native sibling.
export function read(effect, key) {
  const {
    Array: {
      from,
      [(effect(), 'of')]: of,
      [key]: value
    }
  } = globalThis;
  return [from, of, value];
}