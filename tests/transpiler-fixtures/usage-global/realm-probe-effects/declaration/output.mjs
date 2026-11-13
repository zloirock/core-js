import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// Consuming a backed claim still evaluates the effectful realm receiver and its throwing read.
const effects = [];
export function read() {
  const {
    resolve
  } = (effects.push("prefix"), globalThis).window.Promise;
  return typeof resolve;
}