// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Base extends Array {} class Bag extends Base {} return Bag.from([3]) instanceof Bag;
})();
