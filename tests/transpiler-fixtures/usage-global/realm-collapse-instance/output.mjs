import "core-js/modules/es.array.at";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return (effects.push("prefix"), globalThis).window?.globalThis.items?.at(-1);
}