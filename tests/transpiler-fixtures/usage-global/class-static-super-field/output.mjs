import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class Base extends Array {}
class Bag extends Base {
  static f = super.from;
}
export const result = Bag.f.call(Bag, [3]);