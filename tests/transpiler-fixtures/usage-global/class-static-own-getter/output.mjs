import "core-js/modules/es.array.push";
// An own or written static wins over the inherited built-in method.
// Preserve its value, receiver and any getter or key effects.
const effects = [];
export const result = (() => {
  class Bag extends Array {
    static get from() {
      effects.push("get");
      return function () {
        return this === Bag;
      };
    }
  }
  return Bag.from([]);
})();