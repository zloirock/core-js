import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// Excluding the realm entry leaves this declined pattern native.
let key = 'Promise';
export function read({
  globalThis: {
    [key]: {
      prototype
    }
  }
} = (key = 'Array', globalThis)) {
  return prototype;
}