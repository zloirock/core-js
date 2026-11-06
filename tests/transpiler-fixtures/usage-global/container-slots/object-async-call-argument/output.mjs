import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An async callee receives the container and can replace its constructor slot before the read.
const escapedByAsyncCallee = function () {
  const asyncEscape = {
    k: Object
  };
  async function takeAsync(t) {
    t.k = Map;
  }
  void takeAsync(asyncEscape);
  const {
    k: {
      keys
    }
  } = asyncEscape;
  return keys;
}();
export { escapedByAsyncCallee };