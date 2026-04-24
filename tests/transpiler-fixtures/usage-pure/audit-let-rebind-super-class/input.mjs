// `let X = Promise; X = Foo;` - X is reassigned, so its value at any given callsite
// can't be statically pinned to Promise. `super.try(...)` stays raw; if plugin rewrote
// to Promise.try, runtime behaviour would diverge once X points to Foo
let X = Promise;
X = FooClass;
class C extends X {
  static run() { return super.try(() => 1); }
}
