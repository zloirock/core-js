import _isIterable from "@core-js/pure/actual/is-iterable";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return _isIterable([3]);
}