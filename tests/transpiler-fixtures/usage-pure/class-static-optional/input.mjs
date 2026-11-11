// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Bag extends Array {} return Bag?.from?.([3]) instanceof Bag;
})();
