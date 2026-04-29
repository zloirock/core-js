import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.function.metadata";
import "core-js/modules/esnext.symbol.metadata";
// decorator expression itself uses a polyfilled built-in: the expression is scanned
// and the runtime call inside the decorator is rewritten.
@Promise.resolve(decorator)
class A {
  @Array.from([1, 2, 3])
  method() {}
}