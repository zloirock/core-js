// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Bag extends Array {} const result = Bag.from([3]); return [result[0], result instanceof Bag];
})();
