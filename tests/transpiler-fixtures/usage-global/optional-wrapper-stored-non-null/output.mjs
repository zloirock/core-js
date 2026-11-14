import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A bare non-null assertion erases without ending the optional chain or moving its effects.
declare global {
  var box: number;
}
export function read(choice) {
  const effects = [];
  let held;
  return (held = globalThis.window)?.self!.box;
}