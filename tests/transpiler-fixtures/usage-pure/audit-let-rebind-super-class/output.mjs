import _Promise from "@core-js/pure/actual/promise/constructor";
// `let X = Promise; X = Foo;` - reassignment makes the binding non-constant.
// resolveSuperClassName checks `binding.constantViolations?.length` and returns null,
// so `super.try(...)` inside the class is NOT polyfilled. At runtime `X` might point
// to anything, so static `Promise.try` rewrite would be unsafe.
let X = _Promise;
X = FooClass;
class C extends X {
  static run() {
    return super.try(() => 1);
  }
}