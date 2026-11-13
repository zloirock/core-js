import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.function.name";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A retained read performs the store once, even when the later hop throws.
export function read() {
  let held;
  try {
    const {
      resolve
    } = (held = globalThis.self).window.Promise;
    return [typeof resolve, held === globalThis.self];
  } catch (error) {
    return [error.name, held === globalThis.self];
  }
}