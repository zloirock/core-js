import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// The key observes the binding before initialization; the next sibling observes its new value.
export function read(log) {
  function key() {
    log.push(typeof resolve);
    return 'Promise';
  }
  var {
    globalThis: {
      [key()]: {
        resolve
      }
    },
    next
  } = globalThis;
  return [resolve, next];
}