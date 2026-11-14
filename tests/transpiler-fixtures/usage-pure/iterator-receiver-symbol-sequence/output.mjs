import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _isIterable from "@core-js/pure/actual/is-iterable";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return _pushMaybeArray(effects).call(effects, "a"), _pushMaybeArray(effects).call(effects, "b"), _isIterable([3]);
}