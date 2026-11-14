import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const list = [1];
  const it = (list, _pushMaybeArray(effects).call(effects, 1), _pushMaybeArray(effects).call(effects, 2), _getIteratorMethod(list));
  return it.call(list).next().value;
}