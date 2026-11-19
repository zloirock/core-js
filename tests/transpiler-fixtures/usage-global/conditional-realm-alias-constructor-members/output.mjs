import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A later alias retains the possible realm value of a conditionally initialized binding.
// Its constructor guard carries the namespace needed by the following static member read.
function read() {
  try {
    var realm = globalThis;
  } finally {}
  const held = realm;
  return held.Promise.allSettled([]);
}