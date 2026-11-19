// Source parentheses keep the read outside the optional chain, including after type erasure.
export function read(choice) {
  const effects = [];
  let held;
  return ((held = globalThis.window)?.self as any).box;
}
