// decorated class with static override using `super.method(...)`: the static-method
// call routes through the pure-mode polyfilled super.
class A extends Array {
  @bound static from(x) { return super.from(x); }
}
