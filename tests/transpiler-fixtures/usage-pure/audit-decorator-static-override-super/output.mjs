import _Array$from from "@core-js/pure/actual/array/from";
// decorated class with static override using `super.method(...)`: the static-method
// call routes through the pure-mode polyfilled super.
class A extends Array {
  @bound
  static from(x) {
    return _Array$from.call(this, x);
  }
}