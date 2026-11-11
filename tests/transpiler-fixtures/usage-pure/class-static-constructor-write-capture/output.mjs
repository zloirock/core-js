import _Array$of from "@core-js/pure/actual/array/of";
// Capturing the inherited static precedes the constructor's own replacement.
export const result = (() => {
  class Bag extends Array {
    constructor(...values) {
      super(...values);
      Bag.of = () => 31;
    }
    static read() {
      return Bag.of(5);
    }
  }
  const of = (Bag, _Array$of);
  return [of.call(Bag, 6)[0], Bag.read()];
})();