import _Promise from "@core-js/pure/actual/promise";
// `class C extends X` where the `let` X is overwritten before the class: the heritage is no longer
// provably Promise, so `super.try()` stays raw - a safe miss over a wrong static dispatch. the census
// holds every value ever written to the heritage binding, its overwritten init included, so that init
// imports the namespace entry, not `*/constructor` - an accepted over-hold
let X = _Promise;
X = something;
class C extends X {
  static run() {
    return super.try(() => 1);
  }
}
C.run();