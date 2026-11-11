class Base extends Array {}
class Bag extends Base {
  static f = super.from;
}
export const result = Bag.f.call(Bag, [3]);
