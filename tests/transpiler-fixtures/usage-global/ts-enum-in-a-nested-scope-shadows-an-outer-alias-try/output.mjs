import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
const P = Promise;
function f() {
  enum P {
    allSettled = 1
  }
  return P.allSettled;
}
use(f(), P.try(g));