// An own or written static wins over the inherited built-in method.
// Preserve its value, receiver and any getter or key effects.
const effects = [];
export const result = (() => {
const Base = class extends Array {}; Base.from = function () { return 22; }; class Bag extends Base {} return Bag.from([]);
})();
