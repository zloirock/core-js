import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// `const { Promise: MyP } = globalThis.self` - destructure init is a MemberExpression whose
// root is a known global proxy (`globalThis.self`). super-class resolution must walk through
// the member chain so `super.try()` maps to `Promise.try`, not to `self`
const MyP = _Promise;
class C extends MyP {
  static run(x) {
    return _Promise$try.call(this, x);
  }
}