import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A constructor bound by a parameter remains a native receiver in the body.
function read({
  Promise: P
} = globalThis) {
  return P.resolve(1);
}
read();