import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {}
  const result = (Bag, _pushMaybeArray(effects).call(effects, "key"), _Array$from.call(Bag, (_pushMaybeArray(effects).call(effects, "arg"), [3])));
  return result instanceof Bag;
})();