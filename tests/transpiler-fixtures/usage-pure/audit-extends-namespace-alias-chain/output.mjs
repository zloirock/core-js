import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// chained identifier alias inside user namespace: `const MyP = Promise; const NS = { P: MyP }`.
// resolver recurses on the property value (MyP), which is itself resolved via the identifier
// alias walker. `super.try(...)` still routes through the Promise polyfill through two hops
const MyP = _Promise;
const NS = {
  P: MyP
};
class C extends NS.P {
  static run() {
    return _Promise$try.call(this, () => 1);
  }
}