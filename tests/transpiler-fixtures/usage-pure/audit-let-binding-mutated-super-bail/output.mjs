import _Promise from "@core-js/pure/actual/promise/constructor";
// resolveSuperClassName bails on binding.constantViolations (let-binding reassigned).
// super.X cannot be safely polyfilled when extends-target is mutable. polyfill must NOT
// fire for the super-call chain
let X = _Promise;
X = something;
class C extends X {
  static run() {
    return super.try(() => 1);
  }
}
C.run();