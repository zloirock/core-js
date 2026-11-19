import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An own or written static wins over the inherited built-in method.
// Preserve its value, receiver and any getter or key effects.
const effects = [];
export const result = (() => {
  class Bag extends Array {
    static get from() {
      _pushMaybeArray(effects).call(effects, "get");
      return function () {
        return this === Bag;
      };
    }
  }
  return Bag.from([]);
})();