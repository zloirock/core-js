import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// Source parentheses keep the read outside the optional chain, including after type erasure.
declare global {
  var box: number;
}
export function read(choice) {
  const effects = [];
  let held;
  return ((held = globalThis.window)?.self)!.box;
}