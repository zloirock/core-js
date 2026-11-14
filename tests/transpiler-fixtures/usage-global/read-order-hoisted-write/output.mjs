import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// A hoisted function can install a constructor before a textually earlier read.
let r;
let P = null;
init();
P.resolve(1);
r = typeof P.resolve;
function init() {
  P = Promise;
}
use(r);