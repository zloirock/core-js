// `MyPromiseTry` is `Promise.try` — a function, not the Promise class. `class extends
// MyPromiseTry` + `super.try(...)` reads `.try` off the function, which is undefined —
// the user's code is semantically broken. `entryToGlobalHint` rejects method entries
// (`promise/try` isn't `/constructor`), so `MyPromiseTry` gets no `Promise` hint and
// `super.try(...)` doesn't resolve to a super class's static. the plugin leaves the
// broken code alone rather than "fixing" it by pretending `MyPromiseTry` is `Promise`
import MyPromiseTry from '@core-js/pure/actual/promise/try';
class C extends MyPromiseTry {
  static run() {
    return super.try(() => 1);
  }
}