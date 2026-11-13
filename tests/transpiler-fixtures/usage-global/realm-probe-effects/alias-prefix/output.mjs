import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// The sequence prefix runs before a nullable alias is read.
const effects = [];
export function read() {
  const held = globalThis.window;
  return typeof (effects.push("prefix"), held).Promise.resolve;
}