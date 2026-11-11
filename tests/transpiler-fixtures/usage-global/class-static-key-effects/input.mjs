// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
class Bag extends Array {} const result = Bag[(effects.push("key"), "from")]((effects.push("arg"), [3])); return result instanceof Bag;
})();
