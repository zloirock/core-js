import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// A disabled caller source stays native through a plain parameter member read.
function pick(value) {
  return value.resolve;
}
// core-js-disable-next-line
export const r = pick(Promise);