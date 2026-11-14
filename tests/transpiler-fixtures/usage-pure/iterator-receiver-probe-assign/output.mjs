import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  let it;
  it = _getIteratorMethod(globalThis.window?.self);
  return typeof it;
}