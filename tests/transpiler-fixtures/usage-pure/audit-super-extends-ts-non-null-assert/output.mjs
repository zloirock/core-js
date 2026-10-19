import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// non-null assertion (`!`) on the super-class alias - alias chain resolves to
// Promise and `super.resolve` gets polyfilled
const A = _Promise;
// @ts-expect-error a heritage tsc refuses is the shape under test
class C extends A {
  static run() {
    return _Promise$resolve.call(this, 1);
  }
}
_globalThis.__r = C.run();