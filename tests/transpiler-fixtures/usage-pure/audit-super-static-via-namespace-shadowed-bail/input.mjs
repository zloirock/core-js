// negative test: a namespace-destructure binding whose leaf is NOT the real global.
// `const NS = { Promise: FakePromise }` shadows the key with an unrelated class, so
// `extends NS.Promise` is FakePromise. the super-class resolution must follow the actual
// leaf binding (no known global), leaving `super.try()` native - a safe miss is preferred
// over a wrong polyfill dispatch that would break runtime semantics.
class FakePromise {}
const NS = { Promise: FakePromise };
const { Promise: MyP } = NS;
class C extends MyP {
  static run() { return super.try(() => 1); }
}
C.run();
