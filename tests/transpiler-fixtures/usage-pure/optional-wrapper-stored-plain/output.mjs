import _globalThis from "@core-js/pure/actual/global-this";
// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  let held;
  return (held = _globalThis.window)?.box;
}