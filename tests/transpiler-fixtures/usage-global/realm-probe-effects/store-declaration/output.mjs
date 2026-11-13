import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// The saved realm and its unbacked hop survive consuming the whole pattern.
export function read() {
  let held;
  const {
    resolve
  } = (held = globalThis.self).window.Promise;
  return typeof resolve;
}