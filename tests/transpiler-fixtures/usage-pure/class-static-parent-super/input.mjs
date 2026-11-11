// An own or written static wins over the inherited built-in method.
// Preserve its value, receiver and any getter or key effects.
const effects = [];
export const result = (() => {
class Base extends Array { static from() { return this; } } class Bag extends Base { static read() { return super.from([]); } } return Bag.read() === Bag;
})();
