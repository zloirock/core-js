import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.function.name";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A getter hop read by an instance member and then a static member is memoized once before
// either read in a let declarator.
class KE {
  static get P() {
    log();
    return Promise;
  }
}
let {
  M: {
    name: nm9,
    any: s9
  }
} = {
  M: KE.P
};
use(nm9, s9);