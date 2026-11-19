// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Bag extends Array { static read() { return Bag.from([3]); } } return Bag.read() instanceof Bag;
})();
