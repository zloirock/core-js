import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
export function read() {
  let held;
  return typeof (held = globalThis.self).window.Promise.resolve;
}