// A `super.method?.()` optional chain with >=2 trailing instance polyfills must combine into ONE
// guard, not overlapping standalone transforms (which crashed: "could not locate inner needle").
// the combine memoizes the method-GET `super.flat` (assignable, unlike the receiver `super`) and
// calls it with `this` (`_ref.call(this)`); the super method stays native, the trailing `.map` / `.at`
// polyfills thread on the result
class Wrapped extends Array {
  tail() {
    return super.flat?.().map(x => x).at(-1);
  }
}
