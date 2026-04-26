import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// optional call on a super method `super.m?.(...)`: the polyfill rewrite must respect
// the optional gate but still resolve through the superclass.
class A extends Array {
  static f() {
    super.from?.("abc");
  }
}