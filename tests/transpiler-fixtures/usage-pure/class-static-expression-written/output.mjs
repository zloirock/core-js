// An own or written static wins over the inherited built-in method.
// Preserve its value, receiver and any getter or key effects.
const effects = [];
export const result = (() => {
  const Bag = class extends Array {};
  Bag.from = function () {
    return 21;
  };
  return Bag.from([]);
})();