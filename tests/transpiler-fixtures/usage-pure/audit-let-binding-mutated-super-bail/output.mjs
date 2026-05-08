import _Promise from "@core-js/pure/actual/promise/constructor";
// `class C extends X` where `X` is a `let` binding reassigned to something else. the
// extends-target is no longer statically known to be Promise, so `super.try()` must
// NOT polyfill - safe miss preferred over wrong static dispatch
let X = _Promise;
X = something;
class C extends X {
  static run() {
    return super.try(() => 1);
  }
}
C.run();