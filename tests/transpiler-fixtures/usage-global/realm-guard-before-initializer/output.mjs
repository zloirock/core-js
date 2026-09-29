import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A closure declared before the realm initializer retains the constructor's static family.
function f() {
  return g.Promise.resolve(1);
}
var g = globalThis;
export const result = typeof f().then;