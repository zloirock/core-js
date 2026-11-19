import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
// A dominating realm initializer permits a named static read without a constructor namespace.
var g = globalThis;
function f() {
  return g.Promise.resolve(1);
}
export const result = typeof f().then;