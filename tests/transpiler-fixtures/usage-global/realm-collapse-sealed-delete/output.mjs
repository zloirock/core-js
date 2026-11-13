import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return delete (globalThis.window?.Promise)[effects.push("key"), "noSuchStatic"];
}