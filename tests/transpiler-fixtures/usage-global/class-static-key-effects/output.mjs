import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// A subclass static keeps its receiver and the source evaluation order.
const effects = [];
export const result = (() => {
  class Bag extends Array {}
  const result = Bag[effects.push("key"), "from"]((effects.push("arg"), [3]));
  return result instanceof Bag;
})();