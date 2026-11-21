import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
class Base extends Array {
  static read() {
    return this.from([1])[0];
  }
}
class Derived extends Base {
  static from() {
    return [9];
  }
}
export const result = [Base.read(), Derived.read()];