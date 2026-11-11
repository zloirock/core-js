// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Bag extends Array {} const from = Bag.from; return from.call(Bag, [3]) instanceof Bag;
})();
