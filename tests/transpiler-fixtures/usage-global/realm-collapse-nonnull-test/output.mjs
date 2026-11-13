import "core-js/modules/es.global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return delete (globalThis != null).window.slotD;
}