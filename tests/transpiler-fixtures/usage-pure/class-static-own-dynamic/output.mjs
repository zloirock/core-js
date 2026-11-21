import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An own or written static wins over the inherited built-in method.
// Preserve its value, receiver and any getter or key effects.
const effects = [];
export const result = (() => {
  function key() {
    _pushMaybeArray(effects).call(effects, "key");
    return "from";
  }
  class Bag extends Array {
    static [key()]() {
      return 13;
    }
  }
  return (!("from" in Bag) ? {
    from: _Array$from.bind(Bag)
  } : Bag).from([]);
})();