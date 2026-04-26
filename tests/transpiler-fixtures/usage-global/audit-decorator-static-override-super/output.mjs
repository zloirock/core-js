import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// decorated class with static override using `super.f(...)`: the static-method call
// still routes through the polyfilled super constructor.
class A extends Array {
  @bound
  static from(x) {
    return super.from(x);
  }
}