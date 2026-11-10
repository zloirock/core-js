import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.global-this";
// The supplied argument and the parameter default keep their own evaluation slots.
export const effects = [];
export const r = (() => {
  return function ({
    Promise: P
  } = Object) {
    return [typeof P, arguments[0] === globalThis];
  }(globalThis);
})();