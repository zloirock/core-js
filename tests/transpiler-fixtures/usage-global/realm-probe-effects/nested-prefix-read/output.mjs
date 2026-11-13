import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// A read through an optional result preserves both receiver prefixes before its throw.
const effects = [];
export function read() {
  return typeof ((effects.push("a"), effects.push("b"), globalThis.window)?.Promise).resolve;
}