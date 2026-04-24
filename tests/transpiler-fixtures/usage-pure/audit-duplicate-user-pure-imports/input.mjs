// user imports the same core-js entry twice with different local names. first-write-wins
// in registerUserPureImport means only `_Promise` is registered; `MyPromise` ends up as
// a distinct local binding. `class extends MyPromise { static foo() { super.withResolvers(); } }`
// may fail to route `super.withResolvers()` to the polyfill because second binding's
// importInfoByName entry is absent
import _Promise from '@core-js/pure/actual/promise';
import MyPromise from '@core-js/pure/actual/promise';
class Foo extends MyPromise {
  static run() { return super.try(() => 1); }
}
new _Promise((r) => r(1));
new Foo();
