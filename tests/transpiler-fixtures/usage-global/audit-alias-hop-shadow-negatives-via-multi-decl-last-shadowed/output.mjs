import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// The last var initializer wins; no guard may revive the earlier constructor.
const multiRoot = Promise;
export function viaMultiDeclLastShadowed() {
  {
    var multiHeld = multiRoot;
  }
  {
    const multiRoot = {};
    var multiHeld = multiRoot;
  }
  {
    const {
      allSettled
    } = multiHeld;
    return allSettled([]);
  }
}