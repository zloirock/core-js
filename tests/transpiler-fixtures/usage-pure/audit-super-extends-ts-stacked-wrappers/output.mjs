import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// stacked TS wrappers on the super-class alias: `(X satisfies Y) as Z`
const A = _Promise;
// @ts-expect-error a heritage tsc refuses is the shape under test
class C extends A {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}
_globalThis.__r = C.run();