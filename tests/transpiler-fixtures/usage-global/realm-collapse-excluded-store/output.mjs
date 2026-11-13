import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  let held;
  return [delete (held = (effects.push("prefix"), globalThis)).self.slotD, typeof held];
}