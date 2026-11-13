import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return delete globalThis.self?.window?.window?.Reflect.slot;
}