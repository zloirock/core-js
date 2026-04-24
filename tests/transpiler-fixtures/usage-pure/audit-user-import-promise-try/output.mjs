// User imports `MyPromiseTry` from `@core-js/pure/actual/promise/try` - that is the
// `Promise.try` function itself, not the `Promise` constructor. `class extends
// MyPromiseTry` + `super.try(...)` is semantically broken user code; plugin does
// not pretend `MyPromiseTry` is `Promise` and leaves the code untouched.
import MyPromiseTry from '@core-js/pure/actual/promise/try';
class C extends MyPromiseTry {
  static run() {
    return super.try(() => 1);
  }
}