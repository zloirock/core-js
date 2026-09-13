// An absent or falsy stored window keeps the original short-circuit value and failure.
// A truthy operand selects the realm, which still needs the Promise polyfill.
export function read() {
  let held;
  return ((held = globalThis.window) && globalThis).Promise.length;
}
