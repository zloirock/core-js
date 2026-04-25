// pure mode parity: 2-level namespace chain resolves to Promise; super.try emits the
// pure polyfill helper alongside extends-receiver rewriting
class Box {
  static Promise = Promise;
}
const NS = { Holder: Box };
class C extends NS.Holder.Promise {
  static foo() { return super.try(() => 1); }
}
C.foo();