import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  const g = globalThis;
  return g.window?.Reflect?.slot;
}