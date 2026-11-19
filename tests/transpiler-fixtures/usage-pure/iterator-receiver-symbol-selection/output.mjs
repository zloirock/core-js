import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol";
// Iterator keys preserve source guards, effects and receiver identity.
export function read(choice) {
  const effects = [];
  return (_pushMaybeArray(effects).call(effects, "test"), choice) ? _Symbol : _Symbol, _isIterable([3]);
}