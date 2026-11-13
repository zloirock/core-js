import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Prefixes at distinct receiver levels preserve their evaluation order.
const effects = [];
export function read() {
  const held = globalThis.window;
  return typeof (effects.push("a"), (effects.push("b"), held).self).Promise.resolve;
}