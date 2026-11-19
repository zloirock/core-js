import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
// Parentheses around a nullable base do not prevent its guarded static from being served.
export function read(choice) {
  const effects = [];
  let w: any = globalThis;
  if (choice) w = null;
  return w?.Array.of((effects.push("arg"), 3))[0];
}