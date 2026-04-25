// `globalThis` shadowed by a function parameter - the parameter could carry any object at
// runtime, not the real proxy global. `super.try` correctly does NOT route to `Promise.try`:
// `globalThis.Promise` reads off the user's argument, not native Promise. plugin consults
// scope bindings via the predicate so the shadowed name doesn't trigger over-injection
function f(globalThis) {
  class C extends globalThis.Promise {
    static foo() { return super.try(() => 1); }
  }
  return C;
}
f({}).foo();
