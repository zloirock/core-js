import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// ... and the same write once the container itself leaves: through a call, through an export, or
// into a receiver this census cannot name at all - the value is reachable wherever the container is
const passed = {
  k: Object
};
passed.k = Promise;