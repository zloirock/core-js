// A parameter default mirrors the known constructor's prototype methods.
// A supplied object still reads its own properties and runs its own leaf default.
export function read({ prototype: { at = Array.from, flat } } = Array) {
  return [at, flat];
}
