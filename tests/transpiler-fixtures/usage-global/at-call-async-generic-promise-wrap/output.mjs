import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
// @ts-expect-error an async function whose annotation omits the Promise is the shape under test
async function wrap<T>(x: T): T {
  return x;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
wrap('hello').finally(() => {});