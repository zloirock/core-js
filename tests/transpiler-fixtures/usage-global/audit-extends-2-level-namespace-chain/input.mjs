// extends through a 2-level namespace chain (`NS.Holder.Promise`) - container resolution
// walks both hops to reach the underlying global, so `super.try` triggers Promise.try
// polyfill emission alongside the constructor pollution
class Box {
  static Promise = Promise;
}
const NS = { Holder: Box };
class C extends NS.Holder.Promise {
  static foo() { return super.try(() => 1); }
}
C.foo();