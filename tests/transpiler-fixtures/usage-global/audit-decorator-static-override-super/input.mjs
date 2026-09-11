// decorated class with static override using `super.f(...)`: the static-method call
// still routes through the polyfilled super constructor.
class A extends Array {
  @bound static from(x) { return super.from(x); }
}
