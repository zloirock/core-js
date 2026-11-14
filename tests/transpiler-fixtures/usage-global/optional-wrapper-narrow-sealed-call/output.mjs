import "core-js/modules/es.array.of";
import "core-js/modules/es.array.push";
// Source parentheses keep the read outside the optional chain, including after type erasure.
export function read(choice) {
  const effects = [];
  const w: any = typeof window !== "undefined" ? window : undefined;
  return (w?.Array.of((effects.push("arg"), 3)))!.length;
}