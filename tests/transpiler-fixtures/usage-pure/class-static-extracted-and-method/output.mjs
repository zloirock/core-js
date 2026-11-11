import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// A captured inherited builtin does not expose the class to an unknown callee.
export const result = (() => {
  class Base extends Array {}
  class Bag extends Base {
    static fromBase(xs) {
      return _Array$from.call(this, xs);
    }
    read() {
      return _Array$of.call(Bag, 5);
    }
  }
  const of = (Bag, _Array$of);
  return [new Bag().read()[0], of.call(Bag, 6)[0]];
})();