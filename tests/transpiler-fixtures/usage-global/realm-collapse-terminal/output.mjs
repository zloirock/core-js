import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Keep the source probe, receiver and effects across realm collapse.
export function read(choice, effects) {
  return typeof (effects.push("prefix"), globalThis.window)?.self;
}