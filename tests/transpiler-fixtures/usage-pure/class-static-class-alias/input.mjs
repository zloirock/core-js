// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Bag extends Array {} const B = Bag; return B.of(3) instanceof Bag;
})();
