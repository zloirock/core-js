import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// pure mode parity: 2-level namespace chain resolves to Promise; super.try emits the
// pure polyfill helper alongside extends-receiver rewriting
class Box {
  static Promise = _Promise;
}
const NS = {
  Holder: Box
};
class C extends NS.Holder.Promise {
  static foo() {
    return _Promise$try.call(this, () => 1);
  }
}
C.foo();