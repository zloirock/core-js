import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// An effect-free local call names the realm hop of a nested static read.
export function read() {
  function key() {
    return "self";
  }
  return typeof globalThis[key()].Promise.resolve;
}