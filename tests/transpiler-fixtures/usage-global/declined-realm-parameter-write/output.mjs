import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
// The receiver default writes the key before the retained nested pattern reads it.
// Supplying an argument skips that initializer; no parameter read moves into the body.
let key = 'Promise';
export function read({
  globalThis: {
    [key]: {
      prototype
    }
  }
} = (key = 'Array', globalThis)) {
  return Array.isArray(prototype);
}
read();