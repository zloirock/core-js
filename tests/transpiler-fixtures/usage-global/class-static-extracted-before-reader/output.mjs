import "core-js/modules/es.array.of";
// A captured inherited builtin does not expose the class to an unknown callee.
export const result = (() => {
  class Bag extends Array {}
  const of = Bag.of;
  function read() {
    return Bag.of(5);
  }
  return [read()[0], of.call(Bag, 6)[0]];
})();