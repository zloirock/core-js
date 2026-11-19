import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return delete (effects.push("a"), effects.push("b"), globalThis.window)?.["slotD"];
}