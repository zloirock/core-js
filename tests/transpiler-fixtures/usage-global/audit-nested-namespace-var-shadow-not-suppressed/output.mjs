import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// a `var` buried in a nested namespace stays namespace-scoped at every level, so it must not
// suppress the polyfill for the real global used at module scope outside the namespaces
namespace A {
  namespace B {
    var Promise: any;
  }
}
Promise.resolve(1);