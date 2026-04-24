import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _globalThis from "@core-js/pure/actual/global-this";
// TSSatisfiesExpression wrapper on the super-class alias - alias chain resolves
// through to Promise and `super.try` gets polyfilled
const A = _Promise;
class C extends A {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
_globalThis.__r = C.run();