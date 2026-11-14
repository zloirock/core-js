// A bare non-null assertion erases without ending the optional chain or moving its effects.
export function read(choice) {
  const effects = [];
  let held;
  return (held = globalThis.window)?.self.box;
}
