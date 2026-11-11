// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
const Bag = class extends Array {}; return Bag.of(3) instanceof Bag;
})();
