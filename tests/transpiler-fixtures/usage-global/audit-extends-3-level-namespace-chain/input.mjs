// 3-level namespace chain - container resolution composes through any depth, super.try
// reaches Promise.try via the recursive walk
class Box {
  static Promise = Promise;
}
const NS = { Inner: { Holder: Box } };
class C extends NS.Inner.Holder.Promise {
  static foo() { return super.try(() => 1); }
}
C.foo();