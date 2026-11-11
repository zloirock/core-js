import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class Base extends Array {}
class Bag extends Base {
  static read() {
    const from = super[effect(), "from"];
    return from.call(this, [3]);
  }
}
export const result = Bag.read();