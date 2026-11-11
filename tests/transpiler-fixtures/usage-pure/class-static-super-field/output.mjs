import _Array$from from "@core-js/pure/actual/array/from";
class Base extends Array {}
class Bag extends Base {
  static f = _Array$from;
}
export const result = Bag.f.call(Bag, [3]);