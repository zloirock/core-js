import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  let held;
  return (effects.push("prefix"), held = globalThis.window)?.self![effects.push("key"), "box"];
}