import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.string.iterator";
// a nested-block `var` holding a computed static key. the computed-key alias-follow threads the use
// path into the binding lookup so the synthetic var-hoist binding surfaces and `Array[K]` resolves
// to the static, injecting its polyfill
function f(c) {
  if (c) {
    var K = 'fromAsync';
  }
  return Array[K]([1]);
}
f(true);