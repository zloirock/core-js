import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Nested receiver effects and guarded operations keep source order.
export function read(choice) {
  const effects = [];
  const list = [1];
  const {
    [(_pushMaybeArray(effects).call(effects, 1), _pushMaybeArray(effects).call(effects, 2), _Symbol$iterator)]: it
  } = list;
  return it.call(list).next().value;
}