import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
async function foo(): string {
  return 'hello';
}
function bar() {
  Object.freeze(foo());
}