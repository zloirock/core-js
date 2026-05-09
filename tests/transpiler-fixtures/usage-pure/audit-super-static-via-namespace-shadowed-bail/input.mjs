// negative test: namespace-destructure binding where the leaf value is NOT the global.
// `const NS = { Promise: FakePromise }` shadows the key with an unrelated class, so
// `extends NS.Promise` is FakePromise, not the real Promise. resolveSuperClassName
// must follow the namespace's actual leaf binding (FakePromise) - which doesn't resolve
// to a known global - so `super.try()` stays as native (safe miss preferred over wrong
// polyfill dispatch that would break runtime semantics)
class FakePromise {}
const NS = { Promise: FakePromise };
const { Promise: MyP } = NS;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
C.run();
