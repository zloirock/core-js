// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
let Base = Array; class Bag extends Base {} Base = Object; return Bag.of(3) instanceof Bag;
})();
