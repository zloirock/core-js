import _Array$from from "@core-js/pure/actual/array/from";
function read(drop) {
  class Bag extends Array {
    static from() {
      return [9];
    }
  }
  if (drop) delete Bag.from;
  return (!("from" in Bag) ? {
    from: _Array$from.bind(Bag)
  } : Bag).from([1])[0];
}
export const result = [read(false), read(true)];