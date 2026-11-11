// A constructor invoked before capture has already installed the user method.
export const result = (() => {
  class Bag extends Array {
    constructor(...values) {
      super(...values);
      Bag.of = () => 31;
    }
    static make() {
      return new Bag();
    }
  }
  Bag.make();
  const of = Bag.of;
  return of.call(Bag, 6);
})();