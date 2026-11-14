import _globalThis from "@core-js/pure/actual/global-this";
// Source parentheses keep the read outside the optional chain, including after type erasure.
export function read(choice) {
  const effects = [];
  let held;
  return (held = _globalThis.window).box;
}