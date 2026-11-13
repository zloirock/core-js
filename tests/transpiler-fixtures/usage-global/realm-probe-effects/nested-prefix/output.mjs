import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// Every nested receiver prefix runs before the optional test, including its absent arm.
const effects = [];
export function read() {
  const {
    resolve
  } = (effects.push("a"), effects.push("b"), globalThis.window)?.Promise;
  return typeof resolve;
}