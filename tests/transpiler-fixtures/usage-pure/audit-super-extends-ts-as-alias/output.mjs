import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
import _globalThis from "@core-js/pure/actual/global-this";
// `const A = Promise as typeof Promise` - alias init wrapped in TSAsExpression.
const A = _Promise;
class C extends A {
  static run() {
    return _Promise$resolve.call(this, 1);
  }
}
_globalThis.__r = C.run();