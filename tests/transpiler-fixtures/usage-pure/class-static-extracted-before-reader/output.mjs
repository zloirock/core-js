import _Array$of from "@core-js/pure/actual/array/of";
// A captured inherited builtin does not expose the class to an unknown callee.
export const result = (() => {
  class Bag extends Array {}
  const of = (Bag, _Array$of);
  function read() {
    return _Array$of.call(Bag, 5);
  }
  return [read()[0], of.call(Bag, 6)[0]];
})();