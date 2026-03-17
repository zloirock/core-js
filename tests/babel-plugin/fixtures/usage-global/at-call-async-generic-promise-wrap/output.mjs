import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
async function wrap<T>(x: T): T {
  return x;
}
wrap('hello').finally(() => {});