import _Array$from from "@core-js/pure/actual/array/from";
class Base extends Array {}
class Bag extends Base {
  static read() {
    const from = (effect(), _Array$from);
    return from.call(this, [3]);
  }
}
export const result = Bag.read();